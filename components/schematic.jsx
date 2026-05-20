// schematic.jsx — CubeSat orthographic + isometric schematics

const { useState: useStateS, useMemo: useMemoS } = React;

// Isometric 3U CubeSat — body-mounted solar panels, UHF stub antenna.
// Pure SVG. Theme-aware via CSS custom properties.
//
// Key geometry:
//   • U = min(w,h)*0.14  — 1U in pixels; sized so the 3U body fills ~56% of canvas height
//   • iz.y = -U           — NO z-compression; 3U reads as clearly 3× taller than wide
//   • cy = height/2-U/2   — centres the full bounding box (top rhombus → base rhombus)
//   • All callouts placed RIGHT-of-body so no lines cross the body silhouette
function CubesatSchematic({ width = 800, height = 700, configKey = 0, showCallouts = true, accent = 'cyan' }) {
  const ACC = accent === 'purple' ? 'var(--purple)' : 'var(--cyan)';
  const U = Math.min(width, height) * 0.15;

  const c30 = Math.cos(Math.PI / 6), s30 = Math.sin(Math.PI / 6);
  const ix = { x:  c30*U, y: s30*U };
  const iy = { x: -c30*U, y: s30*U };
  const iz = { x:  0,     y: -U    };

  const W = 1, D = 1, H = 3;

  const cx = width  * 0.45;
  const cy = height * 0.50 - U * 0.50;
  const zMid = (H / 2) * iz.y;

  function pt(x, y, z) {
    return {
      x: cx + ix.x*x + iy.x*y,
      y: cy + ix.y*x + iy.y*y + iz.y*z - zMid,
    };
  }

  const A  = pt(0,0,0), B  = pt(W,0,0), C  = pt(W,D,0), Dp = pt(0,D,0);
  const E  = pt(0,0,H), F  = pt(W,0,H), G  = pt(W,D,H), Hp = pt(0,D,H);

  const poly = ps => ps.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')+'Z';
  const lerp = (a,b,t)  => ({ x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t });
  const add  = (a,b)    => ({ x:a.x+b.x, y:a.y+b.y });
  const scl  = (v,s)    => ({ x:v.x*s,   y:v.y*s   });

  const fS = { x:B.x-A.x, y:B.y-A.y };
  const fT = { x:E.x-A.x, y:E.y-A.y };
  const rS = { x:C.x-B.x, y:C.y-B.y };
  const rT = { x:F.x-B.x, y:F.y-B.y };
  const tS = { x:F.x-E.x, y:F.y-E.y };
  const tT = { x:Hp.x-E.x, y:Hp.y-E.y };
  const lS = { x:C.x-Dp.x, y:C.y-Dp.y };
  const lT = { x:Hp.x-Dp.x, y:Hp.y-Dp.y };

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

  function isoBox(x, y, z, w, d, h, fillT, fillR, fillL, stroke) {
    const p2 = pt(x+w, y, z);
    const p3 = pt(x+w, y+d, z);
    const p4 = pt(x, y+d, z);
    const p5 = pt(x, y, z+h);
    const p6 = pt(x+w, y, z+h);
    const p7 = pt(x+w, y+d, z+h);
    const p8 = pt(x, y+d, z+h);
    return (
      <g key={`${x}-${y}-${z}`}>
        <path d={poly([p5, p6, p7, p8])} fill={fillT} stroke={stroke} strokeWidth=".8"/>
        <path d={poly([p2, p3, p7, p6])} fill={fillR} stroke={stroke} strokeWidth=".8"/>
        <path d={poly([p4, p3, p7, p8])} fill={fillL} stroke={stroke} strokeWidth=".8"/>
      </g>
    );
  }

  const payC  = add(add(Dp, scl(lS,.5)), scl(lT,1/6));
  const antBase = lerp(Hp, G, 0.5);
  const antTip  = add(antBase, scl(iz,1.2));

  const fRails = [1,2].map(i=>({ a:lerp(Dp,Hp,i/3), b:lerp(C,G,i/3) }));
  const rRails = [1,2].map(i=>({ a:lerp(B,F,i/3), b:lerp(C,G,i/3) }));

  const lx = width * 0.695;
  const bw = 155;

  const callouts = showCallouts ? [
    { anchor: antTip, ty: height*0.10, label:'UHF ANT · 437 MHz', acc:ACC },
    { anchor: pt(0.5, 0.5, 2.4), ty: height*0.22, label:'REACTION WHEELS', acc:ACC },
    { anchor: add(add(Dp, scl(lS,.65)), scl(lT,.38)), ty: height*0.34, label:'BODY SOLAR · 28 W', acc:'var(--fg)' },
    { anchor: pt(0.5, 0.5, 1.9), ty: height*0.46, label:'OBC · ARM CORTEX', acc:'var(--fg)' },
    { anchor: pt(0.5, 0.5, 1.35), ty: height*0.58, label:'LI-ION BATTERY', acc:'#c3e88d' },
    { anchor: { x:(B.x+C.x+G.x+F.x)/4, y:(B.y+C.y+G.y+F.y)/4 }, ty: height*0.70, label:'STAR TRACKER', acc:'var(--fg)' },
    { anchor: payC, ty: height*0.82, label:'MWIR PAYLOAD', acc:'#f78c6c' },
  ] : [];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
         style={{ display:'block', overflow:'visible' }}>
      <defs>
        <marker id="sc-arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L8,4 L0,8Z" fill="var(--dimmer)"/>
        </marker>
      </defs>

      {(() => {
        const dlx = Hp.x - 24;
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

      {isoBox(0.2, 0.2, 0.05, 0.6, 0.6, 0.8, '#1a1c23', '#22242b', '#22242b', '#f78c6c')}
      {isoBox(0.15, 0.15, 1.1, 0.7, 0.7, 0.5, '#1a1c23', '#22242b', '#22242b', '#c3e88d')}
      {isoBox(0.1, 0.1, 1.8, 0.8, 0.8, 0.05, '#22242b', '#1a1c23', '#1a1c23', 'var(--fg)')}
      {isoBox(0.1, 0.1, 1.95, 0.8, 0.8, 0.05, '#22242b', '#1a1c23', '#1a1c23', 'var(--fg)')}
      {isoBox(0.3, 0.3, 2.2, 0.4, 0.4, 0.4, '#1a1c23', '#22242b', '#22242b', ACC)}

      <path d={poly([E,F,G,Hp])} fill="var(--bg3)" fillOpacity=".75" stroke="var(--fg)" strokeWidth="1.3"/>
      <g opacity=".38">{cellGrid(E, tS, tT, 2, 2, ACC)}</g>
      {(() => {
        const tl = add(add(E, scl(tS,.28)), scl(tT,.2));
        const tr = add(add(E, scl(tS,.72)), scl(tT,.2));
        const br = add(add(E, scl(tS,.72)), scl(tT,.8));
        const bl = add(add(E, scl(tS,.28)), scl(tT,.8));
        return (
          <>
            <path d={poly([tl,tr,br,bl])} fill="var(--bg2)" fillOpacity=".75" stroke={ACC} strokeWidth=".8"/>
            <line x1={lerp(tl,tr,.5).x.toFixed(1)} y1={lerp(tl,tr,.5).y.toFixed(1)}
                  x2={lerp(bl,br,.5).x.toFixed(1)} y2={lerp(bl,br,.5).y.toFixed(1)}
                  stroke={ACC} strokeWidth=".5"/>
            <line x1={lerp(tl,bl,.5).x.toFixed(1)} y1={lerp(tl,bl,.5).y.toFixed(1)}
                  x2={lerp(tr,br,.5).x.toFixed(1)} y2={lerp(tr,br,.5).y.toFixed(1)}
                  stroke={ACC} strokeWidth=".5"/>
          </>
        );
      })()}

      <path d={poly([B,C,G,F])} fill="var(--bg3)" fillOpacity=".75" stroke="var(--fg)" strokeWidth="1.3"/>
      <g opacity=".72">{cellGrid(B, rS, rT, 2, 6, 'var(--cyanDim)')}</g>
      {rRails.map((r,i)=>(
        <line key={i} x1={r.a.x.toFixed(1)} y1={r.a.y.toFixed(1)}
              x2={r.b.x.toFixed(1)} y2={r.b.y.toFixed(1)}
              stroke="var(--fg)" strokeWidth="2"/>
      ))}
      {[1,2].map(i=>{
        const p = lerp(lerp(B,F,i/3), lerp(C,G,i/3), 0.62);
        return <text key={i} x={(p.x+3).toFixed(1)} y={(p.y+2).toFixed(1)}
                     fill="var(--dimmer)" fontSize="8.5" fontFamily="JetBrains Mono"
                     style={{letterSpacing:'.1em'}}>{i}U</text>;
      })}

      <path d={poly([Dp,C,G,Hp])} fill="var(--bg2)" fillOpacity=".75" stroke="var(--fg)" strokeWidth="1.3"/>
      <g opacity=".72">{cellGrid(Dp, lS, lT, 2, 6, 'var(--cyanDim)')}</g>
      {fRails.map((r,i)=>(
        <line key={i} x1={r.a.x.toFixed(1)} y1={r.a.y.toFixed(1)}
              x2={r.b.x.toFixed(1)} y2={r.b.y.toFixed(1)}
              stroke="var(--fg)" strokeWidth="2"/>
      ))}

      <circle cx={payC.x.toFixed(1)} cy={payC.y.toFixed(1)} r={(U*.24).toFixed(1)}
              fill="var(--bg)" stroke="#f78c6c" strokeWidth="1.3"/>
      <circle cx={payC.x.toFixed(1)} cy={payC.y.toFixed(1)} r={(U*.14).toFixed(1)}
              fill="none" stroke="#f78c6c" strokeWidth=".8" strokeDasharray="1.5 2.5"/>
      <circle cx={payC.x.toFixed(1)} cy={payC.y.toFixed(1)} r={(U*.045).toFixed(1)} fill="#f78c6c"/>

      <line x1={(antBase.x-tS.x*.3).toFixed(1)} y1={(antBase.y-tS.y*.3).toFixed(1)}
            x2={(antBase.x+tS.x*.3).toFixed(1)} y2={(antBase.y+tS.y*.3).toFixed(1)}
            stroke={ACC} strokeWidth="1.6"/>
      <line x1={antBase.x.toFixed(1)} y1={antBase.y.toFixed(1)}
            x2={antTip.x.toFixed(1)}  y2={antTip.y.toFixed(1)}
            stroke={ACC} strokeWidth="1.6"/>
      <circle cx={antTip.x.toFixed(1)} cy={antTip.y.toFixed(1)} r="3" fill={ACC}/>

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

      <text x="6" y={height-10} fill="var(--dimmer)" fontSize="9" fontFamily="JetBrains Mono"
            style={{letterSpacing:'.14em'}}>ISO · 30° · 1:4 · DWG 0420-003 REV D</text>
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
