// hero-variations.jsx — three hero takes

const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

// Shared mini-nav used at top of each hero
function HeroNav({ compact = false }) {
  return (
    <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding: compact?'14px 24px':'18px 32px', borderBottom:'1px solid var(--line)' }}>
      <div style={{display:'flex', alignItems:'center', gap:18}}>
        <Wordmark/>
        <span style={{color:'var(--dim)', fontSize:11, letterSpacing:'.14em'}}>· <small>by</small> FRONTIER EXPRESS</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:18, fontSize:11.5, letterSpacing:'.12em', color:'var(--dim)'}}>
        {/* <a href="#trade" style={{textDecoration:'none', color:'inherit'}}>TRADE SPACE</a>
        <a href="#db"    style={{textDecoration:'none', color:'inherit'}}>DATABASE</a>
        <a href="#how"   style={{textDecoration:'none', color:'inherit'}}>METHOD</a>
        <a href="#mbse"  style={{textDecoration:'none', color:'inherit'}}>MBSE</a> */}
        <span className="numtag"><Clock/></span>
      </div>
    </nav>
  );
}
function Wordmark(){
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <svg width="22" height="22" viewBox="0 0 22 22">
        <rect x="3.5" y="3.5" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="3.5" y1="11" x2="18.5" y2="11" stroke="currentColor" strokeWidth=".8"/>
        <line x1="11" y1="3.5" x2="11" y2="18.5" stroke="currentColor" strokeWidth=".8"/>
        <circle cx="11" cy="11" r="2.5" fill="currentColor"/>
      </svg>
      <span style={{fontWeight:600, letterSpacing:'.04em'}}>TRAD</span>
    </div>
  );
}

// ── A · SCHEMATIC ──────────────────────────────────────────────────────────
function HeroSchematic({ width = 1280, height = 720 }) {
  return (
    <div className="trad-scope" style={{ width, height, background:'var(--bg)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <HeroNav/>
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', position:'relative' }}>
        {/* faint grid bg only on right */}
        <div style={{ padding:'60px 56px', display:'flex', flexDirection:'column', justifyContent:'center', gap:28 }}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span className="lbl-cyan">FIG. 01.0</span>
            <span className="lbl">TRADE SPACE EXPLORATION · CUBESAT</span>
          </div>
          <h1 style={{ margin:0, fontSize:'var(--h1)', fontWeight:600, lineHeight:1.02, letterSpacing:'-.015em' }}>
            Ten thousand<br/>
            CubeSat designs,<br/>
            <span style={{color:'var(--cyan)'}}>one Pareto front.</span>
          </h1>
          <p style={{margin:0, color:'var(--dim)', maxWidth:480, fontSize:14, lineHeight:1.6}}>
            Trad searches the full design space of 1U–12U CubeSats — selecting parts
            from a 4 218-SKU component catalog, propagating requirements through MBSE,
            and surfacing the configurations that actually close.
          </p>
          <div style={{display:'flex', gap:10, marginTop:6}}>
            <a href="#signup" className="btn btn-pri">NOTIFY ME <Arr/></a>
            {/* <a href="#trade" className="btn">SEE THE DEMO</a> */}
          </div>
          <div style={{display:'flex', gap:24, marginTop:18, color:'var(--dim)', fontSize:11, letterSpacing:'.1em'}}>
            <span><span style={{color:'var(--fg)'}}>4 218</span> · COMPONENTS</span>
            <span><span style={{color:'var(--fg)'}}>~10⁴</span> · DESIGNS / RUN</span>
            <span><span style={{color:'var(--fg)'}}>SysML 1.6</span> · EXPORT</span>
          </div>
        </div>

        <div className="grid-bg" style={{ borderLeft:'1px solid var(--line)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <CubesatSchematic width={width*0.46} height={height*0.78} />
          {/* corner ticker */}
          <div style={{position:'absolute', top:14, left:18}}>
            <CoordReadout>
              <span>X +118.2 Y −042.6 Z +260.0</span><span style={{color:'var(--cyan)'}} className="blink">●</span><span>LIVE</span>
            </CoordReadout>
          </div>
          <div style={{position:'absolute', bottom:14, right:18}}>
            <CoordReadout>
              <span>CONFIG · TR-1042 · OPT</span>
            </CoordReadout>
          </div>
        </div>
      </div>
      {/* bottom status bar */}
      <BottomTicker/>
    </div>
  );
}

function BottomTicker() {
  const items = [
    'TR-1042 · 4.82kg · 22.1W · $412K · OPT',
    'TR-1038 · 5.10kg · 24.3W · $396K',
    'TR-1044 · 3.91kg · 18.0W · $458K · OPT',
    'TR-1051 · 6.40kg · 31.2W · $610K · OPT',
    'TR-1029 · 8.20kg · 38.0W · $722K',
    'TR-1067 · 2.91kg · 14.2W · $282K · OPT',
  ];
  return (
    <div style={{borderTop:'1px solid var(--line)', padding:'8px 24px', display:'flex', gap:24, fontSize:11, color:'var(--dim)', overflow:'hidden', whiteSpace:'nowrap'}}>
      <span className="lbl-cyan" style={{flex:'0 0 auto'}}>RUN · 04A82</span>
      {items.map((t,i)=> <span key={i} style={{flex:'0 0 auto'}}>{t}</span>)}
      <span style={{flex:'0 0 auto', marginLeft:'auto', color:'var(--cyan)'}}>EVAL 9 184 / 10 000</span>
    </div>
  );
}


// ── B · DATA ───────────────────────────────────────────────────────────────
function HeroData({ width = 1280, height = 720 }) {
  return (
    <div className="trad-scope" style={{ width, height, background:'var(--bg)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <HeroNav/>
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'minmax(420px, 0.85fr) 1.4fr', gap:0, position:'relative' }}>
        <div style={{ padding:'60px 56px', display:'flex', flexDirection:'column', justifyContent:'center', gap:28 }}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span className="lbl-cyan">FIG. 01.0</span>
            <span className="lbl">PARETO · ALL VS. ALL</span>
          </div>
          <h1 style={{ margin:0, fontSize:'var(--h1)', fontWeight:600, lineHeight:1.02, letterSpacing:'-.015em' }}>
            Don't pick parts.<br/>
            Pick a <span style={{color:'var(--cyan)'}}>front</span>.
          </h1>
          <p style={{margin:0, color:'var(--dim)', maxWidth:460, fontSize:14, lineHeight:1.6}}>
            Trad enumerates every CubeSat your requirements admit, then lets you
            walk the Pareto front of mass, power, and cost — interactively, in
            your browser.
          </p>
          <div style={{display:'flex', gap:10, marginTop:6}}>
            <a href="#signup" className="btn btn-pri">NOTIFY ME <Arr/></a>
            <a href="#trade" className="btn">EXPLORE</a>
          </div>
          {/* live counters */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--line)', border:'1px solid var(--line)', marginTop:24}}>
            {[
              { k:'DESIGNS EVALUATED', v:'9 184' },
              { k:'PARETO-OPTIMAL',    v:'42' },
              { k:'WALL-CLOCK',        v:'4m 12s' },
            ].map((s,i)=>(
              <div key={i} style={{ background:'var(--bg)', padding:'14px 16px' }}>
                <div className="lbl" style={{marginBottom:6}}>{s.k}</div>
                <div style={{fontSize:22, fontWeight:600, color: i===1?'var(--cyan)':'var(--fg)'}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderLeft:'1px solid var(--line)', padding:'36px 36px 24px', display:'flex', alignItems:'center', justifyContent:'center' }} className="grid-bg">
          <ParetoChart width={width*0.52} height={height*0.74} embedded/>
        </div>
      </div>
      <BottomTicker/>
    </div>
  );
}


// ── C · TERMINAL ───────────────────────────────────────────────────────────
const TERM_LINES = [
  { t:'$ trad explore --bus 3U --orbit "SSO 500km" --payload MWIR-640', c:'fg' },
  { t:'  → loading catalog (4218 SKU) … ok', c:'dim' },
  { t:'  → 11 subsystems · 384 candidate parts after constraint filter', c:'dim' },
  { t:'  → spawning 9184 design points …', c:'dim' },
  { t:'  ┌── eval ────────────────────────────────────────────────┐', c:'dim' },
  { t:'  │ TR-1004  6.40kg  31.2W  $610K   REQ 86% ── ok          │', c:'dim' },
  { t:'  │ TR-1018  4.82kg  22.1W  $412K   REQ 92% ── OPTIMAL ★   │', c:'cyan' },
  { t:'  │ TR-1042  3.91kg  18.0W  $458K   REQ 88% ── OPTIMAL ★   │', c:'cyan' },
  { t:'  │ TR-1067  2.91kg  14.2W  $282K   REQ 81% ── OPTIMAL ★   │', c:'cyan' },
  { t:'  │ TR-1118  8.20kg  38.0W  $722K   REQ 94% ── ok          │', c:'dim' },
  { t:'  └────────────────────────────────────────────────────────┘', c:'dim' },
  { t:'  → 42 Pareto-optimal designs identified', c:'fg' },
  { t:'  → emitting SysML 1.6 model → ./out/trad-04a82.sysml', c:'fg' },
  { t:'  ✓ done in 4m 12s · open in browser:  trad://run/04a82', c:'cyan' },
];

function HeroTerminal({ width = 1280, height = 720 }) {
  const [visible, setVisible] = useStateH(0);
  useEffectH(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i > TERM_LINES.length) { i = 2; }
      setVisible(i);
    }, 380);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="trad-scope" style={{ width, height, background:'var(--bg)', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <HeroNav/>
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1.05fr', position:'relative' }}>
        <div style={{ padding:'60px 56px', display:'flex', flexDirection:'column', justifyContent:'center', gap:28 }}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <span className="lbl-cyan">FIG. 01.0</span>
            <span className="lbl">CLI · SDK · MBSE</span>
          </div>
          <h1 style={{ margin:0, fontSize:'var(--h1)', fontWeight:600, lineHeight:1.02, letterSpacing:'-.015em' }}>
            A trade study<br/>
            in <span style={{color:'var(--cyan)'}}>one command</span>.
          </h1>
          <p style={{margin:0, color:'var(--dim)', maxWidth:480, fontSize:14, lineHeight:1.6}}>
            Trad runs in the cloud and ships a CLI. Point it at your requirements,
            pick a bus, and get back a Pareto-optimal set of CubeSats — plus the
            SysML model that proves it.
          </p>
          <div style={{display:'flex', gap:10, marginTop:6}}>
            <a href="#signup" className="btn btn-pri">NOTIFY ME <Arr/></a>
            <a href="#how" className="btn">METHOD</a>
          </div>
        </div>

        <div className="grid-bg" style={{ borderLeft:'1px solid var(--line)', padding:'40px', display:'flex' }}>
          <div className="brk" style={{ flex:1, background:'var(--bg)', border:'1px solid var(--lineHi)', display:'flex', flexDirection:'column' }}>
            <span style={{position:'absolute',top:-1,left:-1,width:10,height:10,borderTop:'1px solid var(--cyan)',borderLeft:'1px solid var(--cyan)'}}/>
            <span style={{position:'absolute',top:-1,right:-1,width:10,height:10,borderTop:'1px solid var(--cyan)',borderRight:'1px solid var(--cyan)'}}/>
            <span style={{position:'absolute',bottom:-1,left:-1,width:10,height:10,borderBottom:'1px solid var(--cyan)',borderLeft:'1px solid var(--cyan)'}}/>
            <span style={{position:'absolute',bottom:-1,right:-1,width:10,height:10,borderBottom:'1px solid var(--cyan)',borderRight:'1px solid var(--cyan)'}}/>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', borderBottom:'1px solid var(--line)', fontSize:11}}>
              <span style={{display:'flex', gap:6, alignItems:'center', color:'var(--dim)'}}>
                <span style={{width:8,height:8,background:'var(--warn)',borderRadius:'50%'}}/>
                <span style={{width:8,height:8,background:'var(--purple)',borderRadius:'50%'}}/>
                <span style={{width:8,height:8,background:'var(--cyan)',borderRadius:'50%'}}/>
                <span style={{marginLeft:8}}>trad@orbit · ~/missions/aurora-7</span>
              </span>
              <span className="lbl-cyan">PTY/0</span>
            </div>
            <div style={{ padding:'14px 16px', fontSize:12.5, lineHeight:1.6, flex:1, fontFamily:'JetBrains Mono', whiteSpace:'pre' }}>
              {TERM_LINES.slice(0, visible).map((l,i)=>(
                <div key={i} style={{ color: l.c==='cyan'?'var(--cyan)' : l.c==='dim'?'var(--dim)':'var(--fg)' }}>
                  {l.t}
                </div>
              ))}
              <span className="blink" style={{color:'var(--cyan)'}}>▌</span>
            </div>
          </div>
        </div>
      </div>
      <BottomTicker/>
    </div>
  );
}

Object.assign(window, { HeroSchematic, HeroData, HeroTerminal, HeroNav, Wordmark, BottomTicker });
