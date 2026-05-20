// schematic.jsx — CubeSat orthographic + isometric schematics

const { useState: useStateS, useMemo: useMemoS } = React;

// Isometric 3U CubeSat — body-mounted solar panels, UHF stub antenna.
// Pure SVG. Theme-aware via CSS custom properties.
//
// Key geometry fixes vs. previous version:
//   • U = height*0.17  (was 0.11 — body was tiny)
//   • iz.y = -U*0.65   (compressed z so 1:3 aspect doesn't look impossibly tall)
//   • cy = height/2 - U/2  (shifts origin so full bounding box is vertically centred)
//   • All callouts placed RIGHT-of-body so no lines cross the body silhouette
function CubesatSchematic({ width = 560, height = 520, configKey = 0, showCallouts = true, accent = 'cyan' }) {
  const ACC = accent === 'purple' ? 'var(--purple)' : 'var(--cyan)';

  // ── geometry ──────────────────────────────────────────────────────────────
  const U = Math.min(width, height) * 0.17;   // 1 unit (1U) in pixels

  // Isometric axes — 30°, z-axis compressed by 0.65 so the 1:3 body
  // reads as a recognisable box rather than an impossibly tall stick.
  const c30 = Math.cos(Math.PI / 6), s30 = Math.sin(Math.PI / 6);
  const ix = { x:  c30*U, y: s30*U };     // +X: right-forward
  const iy = { x: -c30*U, y: s30*U };     // +Y: left-forward
  const iz = { x:  0,     y: -U*0.65 };   // +Z: up (compressed)

  const W = 1, D = 1, H = 3;  // 1U × 1U × 3U

  // cy is shifted up by U/2 so the FULL bounding box (top rhombus → base
  // rhombus) is vertically centred on the canvas, not just the body mid-point.
  const cx = width  * 0.50;
  const cy = height * 0.50 - U * 0.50;
  const zMid = (H / 2) * iz.y;   // = -0.975*U  (centering offset)

  function pt(x, y, z) {
    return {
      x: cx + ix.x*x + iy.x*y,
      y: cy + ix.y*x + iy.y*y + iz.y*z - zMid,
    };
  }

  // 8 box corners
  const A  = pt(0,0,0), B  = pt(W,0,0), C  = pt(W,D,0), Dp = pt(0,D,0);
  const E  = pt(0,0,H), F  = pt(W,0,H), G  = pt(W,D,H), Hp = pt(0,D,H);

  const poly = ps => ps.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')+'Z';
  const lerp = (a,b,t)  => ({ x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t });
  const add  = (a,b)    => ({ x:a.x+b.x, y:a.y+b.y });
  const scl  = (v,s)    => ({ x:v.x*s,   y:v.y*s   });

  // Per-face span vectors (full span, parallelogram axes)
  const fS = { x:B.x-A.x, y:B.y-A.y };   // front A→B  width
  const fT = { x:E.x-A.x, y:E.y-A.y };   // front A→E  height  (fT.x = 0)
  const rS = { x:C.x-B.x, y:C.y-B.y };   // right B→C  depth
  const rT = { x:F.x-B.x, y:F.y-B.y };   // right B→F  height
  const tS = { x:F.x-E.x, y:F.y-E.y };   // top   E→F  width
  const tT = { x:Hp.x-E.x, y:Hp.y-E.y }; // top   E→Hp depth

  // Solar-cell grid on a parallelogram face.
  // 2 cols × 6 rows = clean readability (matches 2 rows of cells per 1U).
  function cellGrid(p0, vS, vT, cols, rows, color) {
    const el = [];
    for (let r = 0; r <= rows; r++) {
      const t = r/rows;
      const ax = p0.x+vT.x*t, ay = p0.y+vT.y*t;
      el.push(<line key={`h${r}`} x1={ax.toFixed(1)} y1={ay.toFixed(1)}
        x2={(ax+vS.x).toFixed(1)} y2={(ay+vS.y).toFixed(1)} stroke={color} strokeWidth=".65"/>);
    }
    for (let c = 0; c <= cols; c++) {
      const s = c/cols;
      const ax = p0.x+vS.x*s, ay = p0.y+vS.y*s;
      el.push(<line key={`v${c}`} x1={ax.toFixed(1)} y1={ay.toFixed(1)}
        x2={(ax+vT.x).toFixed(1)} y2={(ay+vT.y).toFixed(1)} stroke={color} strokeWidth=".65"/>);
    }
    return el;
  }

  // Feature points
  const payC    = add(add(A, scl(fS,.5)), scl(fT,1/6));   // centre of bottom 1U, front face
  const antBase = lerp(E, F, 0.5);                          // mid of front-top edge
  const antTip  = add(antBase, add(scl(ix,.2), scl(iz,1.7))); // whip tip

  // 1U structural rails (solid dividers at 1/3 and 2/3 up each visible face)
  const fRails = [1,2].map(i=>({ a:lerp(A,E,i/3), b:lerp(B,F,i/3) }));
  const rRails = [1,2].map(i=>({ a:lerp(B,F,i/3), b:lerp(C,G,i/3) }));

  // ── callouts: ALL right-of-body so leader lines never cross the body ──────
  // Anchors sorted top→bottom so leaders don't cross each other either.
  const lx = width * 0.695;   // label box left edge  (≈388 for 560-wide canvas)
  const bw = 128;              // label box width

  const callouts = showCallouts ? [
    // 1. UHF antenna tip  (topmost anchor)
    { anchor: antTip,
      ty: height*0.10, label:'UHF ANT · 437 MHz',   acc:ACC         },
    // 2. solar cells — anchor on upper-right of front face
    { anchor: add(add(A, scl(fS,.65)), scl(fT,.38)),
      ty: height*0.34, label:'BODY SOLAR · 28 W',   acc:'var(--fg)' },
    // 3. star tracker — centre of right face
    { anchor: { x:(B.x+C.x+G.x+F.x)/4, y:(B.y+C.y+G.y+F.y)/4 },
      ty: height*0.56, label:'STAR TRACKER',          acc:'var(--fg)' },
    // 4. payload aperture (bottommost anchor)
    { anchor: payC,
      ty: height*0.78, label:'MWIR PAYLOAD',          acc:ACC         },
  ] : [];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
         style={{ display:'block', overflow:'visible' }}>
      <defs>
        <marker id="sc-arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L8,4 L0,8Z" fill="var(--dimmer)"/>
        </marker>
      </defs>

      {/* ── DIMENSION LINE — anchored to left silhouette (Hp → Dp) ───────── */}
      {(() => {
        const dlx = Hp.x - 18;   // 18px left of left silhouette
        const tmid = (Hp.y + Dp.y) / 2;
        return (
          <g>
            <line x1={Hp.x.toFixed(1)} y1={Hp.y.toFixed(1)} x2={dlx} y2={Hp.y.toFixed(1)} stroke="var(--dimmer)" strokeWidth=".7"/>
            <line x1={Dp.x.toFixed(1)} y1={Dp.y.toFixed(1)} x2={dlx} y2={Dp.y.toFixed(1)} stroke="var(--dimmer)" strokeWidth=".7"/>
            <line x1={dlx} y1={Hp.y.toFixed(1)} x2={dlx} y2={Dp.y.toFixed(1)}
                  stroke="var(--dimmer)" strokeWidth=".7"
                  markerStart="url(#sc-arr)" markerEnd="url(#sc-arr)"/>
            <text x={dlx-4} y={tmid.toFixed(1)} textAnchor="end" dominantBaseline="middle"
                  fill="var(--dimmer)" fontSize="9" fontFamily="JetBrains Mono"
                  style={{letterSpacing:'.1em'}}>340.5 MM</text>
          </g>
        );
      })()}

      {/* ── TOP FACE  (E F G Hp) ─────────────────────────────────────────── */}
      <path d={poly([E,F,G,Hp])} fill="var(--bg3)" stroke="var(--fg)" strokeWidth="1.3"/>
      {/* subdued cell grid on top face */}
      <g opacity=".38">{cellGrid(E, tS, tT, 2, 2, ACC)}</g>
      {/* S-band patch antenna footprint — inset parallelogram on top face */}
      {(() => {
        const tl = add(add(E, scl(tS,.28)), scl(tT,.2));
        const tr = add(add(E, scl(tS,.72)), scl(tT,.2));
        const br = add(add(E, scl(tS,.72)), scl(tT,.8));
        const bl = add(add(E, scl(tS,.28)), scl(tT,.8));
        return (
          <>
            <path d={poly([tl,tr,br,bl])} fill="var(--bg2)" stroke={ACC} strokeWidth=".8"/>
            <line x1={lerp(tl,tr,.5).x.toFixed(1)} y1={lerp(tl,tr,.5).y.toFixed(1)}
                  x2={lerp(bl,br,.5).x.toFixed(1)} y2={lerp(bl,br,.5).y.toFixed(1)}
                  stroke={ACC} strokeWidth=".5"/>
            <line x1={lerp(tl,bl,.5).x.toFixed(1)} y1={lerp(tl,bl,.5).y.toFixed(1)}
                  x2={lerp(tr,br,.5).x.toFixed(1)} y2={lerp(tr,br,.5).y.toFixed(1)}
                  stroke={ACC} strokeWidth=".5"/>
          </>
        );
      })()}

      {/* ── RIGHT FACE  (B C G F) ────────────────────────────────────────── */}
      <path d={poly([B,C,G,F])} fill="var(--bg3)" stroke="var(--fg)" strokeWidth="1.3"/>
      <g opacity=".72">{cellGrid(B, rS, rT, 2, 6, 'var(--cyanDim)')}</g>
      {rRails.map((r,i)=>(
        <line key={i} x1={r.a.x.toFixed(1)} y1={r.a.y.toFixed(1)}
              x2={r.b.x.toFixed(1)} y2={r.b.y.toFixed(1)}
              stroke="var(--fg)" strokeWidth="2"/>
      ))}
      {/* 1U labels on right face */}
      {[1,2].map(i=>{
        const p = lerp(lerp(B,F,i/3), lerp(C,G,i/3), 0.62);
        return <text key={i} x={(p.x+3).toFixed(1)} y={(p.y+2).toFixed(1)}
                     fill="var(--dimmer)" fontSize="8.5" fontFamily="JetBrains Mono"
                     style={{letterSpacing:'.1em'}}>{i}U</text>;
      })}

      {/* ── FRONT FACE  (A B F E) ────────────────────────────────────────── */}
      <path d={poly([A,B,F,E])} fill="var(--bg2)" stroke="var(--fg)" strokeWidth="1.3"/>
      <g opacity=".72">{cellGrid(A, fS, fT, 2, 6, 'var(--cyanDim)')}</g>
      {fRails.map((r,i)=>(
        <line key={i} x1={r.a.x.toFixed(1)} y1={r.a.y.toFixed(1)}
              x2={r.b.x.toFixed(1)} y2={r.b.y.toFixed(1)}
              stroke="var(--fg)" strokeWidth="2"/>
      ))}

      {/* Payload aperture — bottom 1U, centre of front face */}
      <circle cx={payC.x.toFixed(1)} cy={payC.y.toFixed(1)} r={(U*.24).toFixed(1)}
              fill="var(--bg)" stroke={ACC} strokeWidth="1.3"/>
      <circle cx={payC.x.toFixed(1)} cy={payC.y.toFixed(1)} r={(U*.14).toFixed(1)}
              fill="none" stroke={ACC} strokeWidth=".8" strokeDasharray="1.5 2.5"/>
      <circle cx={payC.x.toFixed(1)} cy={payC.y.toFixed(1)} r={(U*.045).toFixed(1)} fill={ACC}/>

      {/* ── UHF STUB ANTENNA ─────────────────────────────────────────────── */}
      {/* ground bar along front-top edge */}
      <line x1={(antBase.x-tS.x*.3).toFixed(1)} y1={(antBase.y-tS.y*.3).toFixed(1)}
            x2={(antBase.x+tS.x*.3).toFixed(1)} y2={(antBase.y+tS.y*.3).toFixed(1)}
            stroke={ACC} strokeWidth="1.6"/>
      {/* whip */}
      <line x1={antBase.x.toFixed(1)} y1={antBase.y.toFixed(1)}
            x2={antTip.x.toFixed(1)}  y2={antTip.y.toFixed(1)}
            stroke={ACC} strokeWidth="1.6"/>
      <circle cx={antTip.x.toFixed(1)} cy={antTip.y.toFixed(1)} r="3" fill={ACC}/>

      {/* ── CALLOUTS ─────────────────────────────────────────────────────── */}
      {callouts.map((c,i)=>(
        <g key={i}>
          <line x1={c.anchor.x.toFixed(1)} y1={c.anchor.y.toFixed(1)}
                x2={lx} y2={c.ty}
                stroke={c.acc} strokeWidth=".7" opacity=".85"/>
          <circle cx={c.anchor.x.toFixed(1)} cy={c.anchor.y.toFixed(1)} r="2.8" fill={c.acc}/>
          <rect x={lx} y={c.ty-9} width={bw} height={18}
                fill="var(--bg)" stroke={c.acc} strokeWidth=".7"/>
          <text x={lx+5} y={c.ty+4} fill={c.acc} fontSize="9.5" fontFamily="JetBrains Mono"
                style={{letterSpacing:'.08em'}}>{c.label}</text>
        </g>
      ))}

      {/* ── DRAWING STAMP ────────────────────────────────────────────────── */}
      <text x="6" y={height-10} fill="var(--dimmer)" fontSize="9" fontFamily="JetBrains Mono"
            style={{letterSpacing:'.14em'}}>ISO · 30° · 1:4 · DWG 0420-003 REV C</text>
    </svg>
  );
}


// ─── MBSE block diagram — used in landing page ──────────────────────────────
function MBSEDiagram({ width = 720, height = 360 }) {
  const blocks = [
    { id:'PWR', t:'POWER',     x:0.08, y:0.18, w:0.18, h:0.22 },
    { id:'ADS', t:'ADCS',      x:0.08, y:0.58, w:0.18, h:0.22 },
    { id:'OBC', t:'OBC / C&DH',x:0.41, y:0.38, w:0.18, h:0.24 },
    { id:'COM', t:'COMMS',     x:0.74, y:0.18, w:0.18, h:0.22 },
    { id:'PLD', t:'PAYLOAD',   x:0.74, y:0.58, w:0.18, h:0.22 },
  ];
  const wires = [
    ['PWR','OBC'], ['ADS','OBC'], ['OBC','COM'], ['OBC','PLD'],
    ['PWR','COM'], ['PWR','PLD'], ['PWR','ADS'],
  ];
  const px = b => ({ x: b.x*width, y: b.y*height, w: b.w*width, h: b.h*height });
  const byId = Object.fromEntries(blocks.map(b=>[b.id, px(b)]));
  function port(b, side){
    if (side==='r') return { x:b.x+b.w, y:b.y+b.h/2 };
    if (side==='l') return { x:b.x,     y:b.y+b.h/2 };
    if (side==='t') return { x:b.x+b.w/2, y:b.y };
    return { x:b.x+b.w/2, y:b.y+b.h };
  }
  function elbow(a,b){
    const mx = (a.x+b.x)/2;
    return `M${a.x} ${a.y} L${mx} ${a.y} L${mx} ${b.y} L${b.x} ${b.y}`;
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display:'block'}}>
      <defs>
        <marker id="m-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--cyan)"/>
        </marker>
      </defs>
      {/* wires */}
      {wires.map(([a,b],i)=>{
        const A = byId[a], B = byId[b];
        const side = A.x < B.x ? ['r','l'] : ['l','r'];
        const p1 = port(A, side[0]), p2 = port(B, side[1]);
        return <path key={i} d={elbow(p1,p2)} stroke="var(--cyan)" strokeWidth="1.1" fill="none" markerEnd="url(#m-arr)" opacity=".9"/>;
      })}
      {/* blocks */}
      {blocks.map(b=>{
        const p = byId[b.id];
        return (
          <g key={b.id} transform={`translate(${p.x},${p.y})`}>
            <rect x="0" y="0" width={p.w} height={p.h} fill="var(--bg)" stroke="var(--fg)" strokeWidth="1.2"/>
            <line x1="0" y1="22" x2={p.w} y2="22" stroke="var(--line)"/>
            <text x="10" y="14" fontSize="10" fontFamily="JetBrains Mono" fill="var(--dim)" style={{letterSpacing:'.14em'}}>BLOCK · {b.id}</text>
            <text x={p.w/2} y={p.h/2 + 8} fontSize="14" fontFamily="JetBrains Mono" fill="var(--fg)" textAnchor="middle" fontWeight="600">{b.t}</text>
            {/* port dots */}
            <circle cx="0" cy={p.h/2} r="2.2" fill="var(--cyan)"/>
            <circle cx={p.w} cy={p.h/2} r="2.2" fill="var(--cyan)"/>
          </g>
        );
      })}
      {/* dwg corner */}
      <text x="8" y={height-8} fontSize="9" fontFamily="JetBrains Mono" fill="var(--dim)" style={{letterSpacing:'.14em'}}>SYSML · IBD · TRAD-MBSE-04</text>
    </svg>
  );
}

Object.assign(window, { CubesatSchematic, MBSEDiagram });
