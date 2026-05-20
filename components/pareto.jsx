// pareto.jsx — interactive Pareto-front scatter (mass × power × cost)

const { useState: useStateP, useMemo: useMemoP, useRef: useRefP } = React;

// generate a deterministic set of design points so re-renders are stable.
const SEED_POINTS = (() => {
  const rng = mulberry32(0xC0DE_4242);
  const arr = [];
  const PLD = ['MWIR-640','SWIR-512','SAR-X','HSI-150','AIS-RX','LIDAR-D'];
  const COM = ['UHF-DIPOLE','S-BAND-2W','X-BAND-8W','OPTI-DL'];
  const ADCS = ['MAGNETO+RW','ST-200+RW','FINE-3RW'];
  for (let i = 0; i < 64; i++) {
    const mass = 2.4 + rng()*9.6;            // 2.4 – 12 kg
    const power = 6 + rng()*38;              // 6 – 44 W
    // cost roughly correlates with mass+power + noise
    const cost = (mass*32 + power*18) * (0.65 + rng()*0.9) + 80;
    const dv   = rng() > 0.6 ? Math.round(rng()*30) : 0;
    arr.push({
      id: 'TR-' + (1000 + i),
      mass: round(mass,2),
      power: round(power,1),
      cost: Math.round(cost),
      dv,
      pld: PLD[(i + Math.floor(rng()*PLD.length))%PLD.length],
      com: COM[Math.floor(rng()*COM.length)],
      adcs: ADCS[Math.floor(rng()*ADCS.length)],
      orbit: rng() > 0.55 ? 'SSO 500 km' : (rng() > 0.5 ? 'LEO 400 km' : 'LEO 600 km'),
      ttc: Math.round(8 + rng()*22),
      reqMet: Math.round(60 + rng()*40),
    });
  }
  // mark pareto-optimal in 2D (min mass, max power). cost is encoded as size.
  const isDominated = (p, all) => all.some(q => q !== p
    && q.mass <= p.mass && q.power >= p.power
    && (q.mass < p.mass || q.power > p.power));
  arr.forEach(p => { p.optimal = !isDominated(p, arr); });
  return arr;
})();

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = seed;
    t = Math.imul(t ^ t >>> 15, 1 | t);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function round(n, p) { const k = 10**p; return Math.round(n*k)/k; }


function ParetoChart({ width = 720, height = 460, embedded = false, onSelect, selectedId, showAll = true, accent = 'cyan' }) {
  const points = SEED_POINTS;
  const [hover, setHover] = useStateP(null);
  const [filter, setFilter] = useStateP({ paretoOnly: false, hideExpensive: false });

  // axes domains
  const dom = useMemoP(() => ({
    mass:  [2, 13],
    power: [4, 46],
    cost:  [Math.min(...points.map(p=>p.cost)), Math.max(...points.map(p=>p.cost))],
  }), []);

  const pad = { l: 64, r: 24, t: 24, b: 48 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;

  const xScale = v => pad.l + ((v - dom.mass[0]) / (dom.mass[1] - dom.mass[0])) * W;
  const yScale = v => pad.t + H - ((v - dom.power[0]) / (dom.power[1] - dom.power[0])) * H;
  const rScale = v => 3.5 + ((dom.cost[1] - v) / (dom.cost[1] - dom.cost[0])) * 7;

  // pareto frontier (sorted by mass asc, points whose power max so far)
  const front = useMemoP(() => points.filter(p=>p.optimal).sort((a,b)=>a.mass-b.mass), []);

  const visible = points.filter(p => {
    if (filter.paretoOnly && !p.optimal) return false;
    if (filter.hideExpensive && p.cost > 700) return false;
    return true;
  });

  const ACC = accent === 'purple' ? 'var(--purple)' : 'var(--cyan)';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap: embedded ? 8 : 14 }}>
      {/* header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span className="lbl-cyan">FIG. 02.1</span>
          <span className="lbl">PARETO · MASS × POWER × COST</span>
        </div>
        {!embedded && (
          <div style={{display:'flex', gap:6}}>
            <button className={'chip ' + (filter.paretoOnly?'on':'')}
                    onClick={()=>setFilter(s=>({...s, paretoOnly:!s.paretoOnly}))}
                    style={{cursor:'pointer'}}>
              {filter.paretoOnly?'■':'□'} OPTIMAL ONLY
            </button>
            <button className={'chip ' + (filter.hideExpensive?'on':'')}
                    onClick={()=>setFilter(s=>({...s, hideExpensive:!s.hideExpensive}))}
                    style={{cursor:'pointer'}}>
              {filter.hideExpensive?'■':'□'} ≤ $700K
            </button>
          </div>
        )}
      </div>

      <div style={{ position:'relative', border:'1px solid var(--line)', background:'var(--bg)' }}>
        {/* corner brackets */}
        <span style={{position:'absolute',top:-1,left:-1,width:10,height:10,borderTop:'1px solid var(--cyan)',borderLeft:'1px solid var(--cyan)'}}/>
        <span style={{position:'absolute',top:-1,right:-1,width:10,height:10,borderTop:'1px solid var(--cyan)',borderRight:'1px solid var(--cyan)'}}/>
        <span style={{position:'absolute',bottom:-1,left:-1,width:10,height:10,borderBottom:'1px solid var(--cyan)',borderLeft:'1px solid var(--cyan)'}}/>
        <span style={{position:'absolute',bottom:-1,right:-1,width:10,height:10,borderBottom:'1px solid var(--cyan)',borderRight:'1px solid var(--cyan)'}}/>

        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{display:'block'}}>
          {/* gridlines */}
          {[2,4,6,8,10,12].map(v=>(
            <g key={'gx'+v}>
              <line x1={xScale(v)} y1={pad.t} x2={xScale(v)} y2={pad.t+H} stroke="var(--line)" strokeWidth=".5" strokeDasharray="2 4"/>
              <text x={xScale(v)} y={pad.t+H+18} fill="var(--dim)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">{v}</text>
            </g>
          ))}
          {[10,20,30,40].map(v=>(
            <g key={'gy'+v}>
              <line x1={pad.l} y1={yScale(v)} x2={pad.l+W} y2={yScale(v)} stroke="var(--line)" strokeWidth=".5" strokeDasharray="2 4"/>
              <text x={pad.l-10} y={yScale(v)+3} fill="var(--dim)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">{v}</text>
            </g>
          ))}

          {/* axes */}
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t+H} stroke="var(--lineHi)"/>
          <line x1={pad.l} y1={pad.t+H} x2={pad.l+W} y2={pad.t+H} stroke="var(--lineHi)"/>

          {/* axis labels */}
          <text x={pad.l-50} y={pad.t-8} fill="var(--dim)" fontSize="10" fontFamily="JetBrains Mono" style={{letterSpacing:'.14em'}}>POWER (W) ↑</text>
          <text x={pad.l+W+8} y={pad.t+H+18} fill="var(--dim)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end" style={{letterSpacing:'.14em'}}>MASS (KG) →</text>

          {/* pareto frontier polyline */}
          <polyline
            points={front.map(p => `${xScale(p.mass)},${yScale(p.power)}`).join(' ')}
            fill="none" stroke={ACC} strokeWidth="1.2" strokeDasharray="3 3" opacity=".7"
          />

          {/* points */}
          {visible.map(p => {
            const isHover = hover && hover.id === p.id;
            const isSel = selectedId === p.id;
            const r = rScale(p.cost);
            return (
              <g key={p.id}
                 onMouseEnter={()=>setHover(p)} onMouseLeave={()=>setHover(null)}
                 onClick={()=>onSelect && onSelect(p)}
                 style={{cursor:'pointer'}}>
                {p.optimal && (
                  <circle cx={xScale(p.mass)} cy={yScale(p.power)} r={r+5}
                          fill="none" stroke={ACC} strokeWidth=".8" opacity=".6" />
                )}
                <circle cx={xScale(p.mass)} cy={yScale(p.power)} r={r}
                        fill={p.optimal ? ACC : (isHover || isSel ? 'var(--fg)' : 'var(--bg2)')}
                        stroke={p.optimal ? ACC : 'var(--lineHi)'}
                        strokeWidth={p.optimal ? 0 : 1}
                        opacity={isHover || isSel || p.optimal ? 1 : .85}/>
                {(isHover || isSel) && (
                  <g>
                    <line x1={xScale(p.mass)} y1={pad.t} x2={xScale(p.mass)} y2={pad.t+H} stroke="var(--fg)" strokeWidth=".5" strokeDasharray="2 3"/>
                    <line x1={pad.l} y1={yScale(p.power)} x2={pad.l+W} y2={yScale(p.power)} stroke="var(--fg)" strokeWidth=".5" strokeDasharray="2 3"/>
                  </g>
                )}
              </g>
            );
          })}

          {/* "you are here" labels for two highlight points */}
          {(() => {
            const labels = [
              front[Math.floor(front.length*0.25)],
              front[Math.floor(front.length*0.75)],
            ].filter(Boolean);
            return labels.map(p => (
              <g key={'lbl-'+p.id}>
                <line x1={xScale(p.mass)} y1={yScale(p.power)} x2={xScale(p.mass)+30} y2={yScale(p.power)-26} stroke={ACC} strokeWidth=".8"/>
                <text x={xScale(p.mass)+34} y={yScale(p.power)-28} fill={ACC} fontSize="10" fontFamily="JetBrains Mono" style={{letterSpacing:'.06em'}}>
                  {p.id}
                </text>
                <text x={xScale(p.mass)+34} y={yScale(p.power)-16} fill="var(--dim)" fontSize="9" fontFamily="JetBrains Mono">
                  ${p.cost}K · {p.mass}kg
                </text>
              </g>
            ));
          })()}

          {/* hover tooltip */}
          {hover && (() => {
            const x = xScale(hover.mass) + 12;
            const y = yScale(hover.power) + 12;
            const flipX = x > width - 200;
            const flipY = y > height - 110;
            const tx = flipX ? xScale(hover.mass) - 200 : x;
            const ty = flipY ? yScale(hover.power) - 100 : y;
            return (
              <g transform={`translate(${tx}, ${ty})`} pointerEvents="none">
                <rect x="0" y="0" width="190" height="90" fill="var(--bg)" stroke={ACC} strokeWidth="1"/>
                <text x="8" y="14" fill={ACC} fontSize="10" fontFamily="JetBrains Mono" style={{letterSpacing:'.1em'}}>
                  {hover.id}{hover.optimal ? ' · OPT' : ''}
                </text>
                <line x1="0" y1="20" x2="190" y2="20" stroke="var(--line)"/>
                <text x="8" y="36" fill="var(--fg)" fontSize="10" fontFamily="JetBrains Mono">MASS  {hover.mass.toFixed(2)} kg</text>
                <text x="8" y="50" fill="var(--fg)" fontSize="10" fontFamily="JetBrains Mono">POWER {hover.power.toFixed(1)} W</text>
                <text x="8" y="64" fill="var(--fg)" fontSize="10" fontFamily="JetBrains Mono">COST  ${hover.cost}K</text>
                <text x="8" y="78" fill="var(--dim)" fontSize="9.5" fontFamily="JetBrains Mono">{hover.pld} · {hover.com}</text>
              </g>
            );
          })()}
        </svg>

        {/* legend strip */}
        {!embedded && (
          <div style={{ display:'flex', gap:18, padding:'8px 14px', borderTop:'1px solid var(--line)', fontSize:11, color:'var(--dim)' }}>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:ACC, display:'inline-block'}}/> Pareto-optimal
            </span>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <span style={{width:8,height:8,borderRadius:'50%',border:'1px solid var(--lineHi)', display:'inline-block'}}/> Dominated
            </span>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <span style={{width:14,height:14,border:'1px dashed '+(accent==='purple'?'var(--purple)':'var(--cyan)'),borderRadius:'50%'}}/> Frontier
            </span>
            <span style={{marginLeft:'auto'}}>R ∝ inverse COST · n={visible.length}/{points.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Companion: details panel for selected point
function ParetoDetails({ point, onClose }) {
  if (!point) return (
    <div className="card" style={{minHeight:300}}>
      <div className="card-hd">
        <span className="lbl">SELECTION · NONE</span>
        <span className="lbl">DET. 02.2</span>
      </div>
      <div style={{color:'var(--dim)', fontSize:12, lineHeight:1.6}}>
        Click a point in the Pareto chart to inspect its component bill of materials, requirement coverage, and mission performance.
      </div>
    </div>
  );
  return (
    <div className="card">
      <div className="card-hd">
        <span className="lbl-cyan">{point.id} {point.optimal && '· OPTIMAL'}</span>
        <button onClick={onClose} style={{background:'transparent',border:'1px solid var(--line)',color:'var(--dim)',padding:'2px 8px',fontSize:10,cursor:'pointer',letterSpacing:'.1em'}}>CLOSE</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 18px', fontSize:12}}>
        <Stat k="MASS"    v={point.mass.toFixed(2) + ' kg'} />
        <Stat k="POWER"   v={point.power.toFixed(1) + ' W'} />
        <Stat k="COST"    v={'$' + point.cost + 'K'} />
        <Stat k="Δv"      v={point.dv + ' m/s'} />
        <Stat k="PAYLOAD" v={point.pld} />
        <Stat k="COMMS"   v={point.com} />
        <Stat k="ADCS"    v={point.adcs} />
        <Stat k="ORBIT"   v={point.orbit} />
      </div>
      <div style={{marginTop:14, paddingTop:12, borderTop:'1px solid var(--line)'}}>
        <div className="lbl" style={{marginBottom:6}}>REQUIREMENT COVERAGE</div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{flex:1, height:6, background:'var(--bg)', border:'1px solid var(--line)', position:'relative'}}>
            <div style={{position:'absolute', inset:0, width: point.reqMet + '%', background:'var(--cyan)'}}/>
          </div>
          <span style={{fontSize:11, color:'var(--cyan)', minWidth:40, textAlign:'right'}}>{point.reqMet}%</span>
        </div>
      </div>
      <div style={{marginTop:14, display:'flex', gap:8}}>
        <button className="btn btn-sm btn-pri">EXPORT SYSML</button>
        <button className="btn btn-sm">CLONE DESIGN</button>
      </div>
    </div>
  );
}
function Stat({ k, v }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',gap:8,borderBottom:'1px dotted var(--line)',padding:'4px 0'}}>
      <span style={{color:'var(--dim)', fontSize:10.5, letterSpacing:'.12em'}}>{k}</span>
      <span style={{color:'var(--fg)'}}>{v}</span>
    </div>
  );
}

Object.assign(window, { ParetoChart, ParetoDetails, SEED_POINTS });
