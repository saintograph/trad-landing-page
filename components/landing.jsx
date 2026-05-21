// landing.jsx — full landing page assembly

const { useState: useStateL, useEffect: useEffectL } = React;

function LandingPage({ width } = {}) {
  const [selPoint, setSelPoint] = useStateL(null);

  // When used inside the design canvas an explicit pixel width is passed;
  // in standalone/responsive mode width is omitted and CSS handles sizing.
  const rootWidth  = width || '100%';
  const schW  = width ? Math.min(width * 0.42, 580) : 560;
  const schH  = width ? 560 : 520;
  const paretoW = width ? Math.min(width * 0.58, 880) : 880;
  const mbseW = width ? Math.min(width * 0.42, 560) : 560;

  return (
    <div className="trad-scope" style={{ width: rootWidth, background:'var(--bg)', color:'var(--fg)', minHeight:600 }}>
      {/* nav */}
      <HeroNav/>

      {/* HERO — schematic-first */}
      <section data-screen-label="01 Hero" style={{ position:'relative' }}>
        <div className="trad-grid-hero">
          <div className="trad-hero-copy">
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <span className="lbl-cyan">FIG. 01.0</span>
              <span className="lbl">TRADE SPACE EXPLORATION · CUBESAT ONLY</span>
            </div>
            <h1 style={{ margin:0, fontSize:'var(--h1)', fontWeight:600, lineHeight:1.02, letterSpacing:'-.015em' }}>
              Ten thousand<br/>
              possible CubeSat designs.<br/>
              <span style={{color:'var(--cyan)'}}>Find the best.</span>
            </h1>
            <p style={{margin:0, color:'var(--dim)', maxWidth:500, fontSize:14, lineHeight:1.6}}>
              Trad is a cloud workbench for systems engineers exploring the
              design space of 1U - 12U CubeSats. Pick parts from a 4 218-SKU
              catalog, propagate requirements through MBSE, and surface the
              configurations that actually close — mass, power, link budget,
              ΔV, and cost, all at <em>once</em>.
            </p>
            <div style={{display:'flex', gap:10, marginTop:6}}>
              <a href="#signup" className="btn btn-pri">NOTIFY ME <Arr/></a>
              {/* <a href="#trade" className="btn">SEE THE DEMO</a> */}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,auto)', gap:'10px 32px', marginTop:24, color:'var(--dim)', fontSize:11, letterSpacing:'.1em'}}>
              <span><span style={{color:'var(--fg)', fontSize:14, fontWeight:600}}>4 218</span><br/>COMPONENTS</span>
              <span><span style={{color:'var(--fg)', fontSize:14, fontWeight:600}}>~10⁴</span><br/>DESIGNS / RUN</span>
              <span><span style={{color:'var(--fg)', fontSize:14, fontWeight:600}}>SysML 1.6</span><br/>EXPORT</span>
            </div>
          </div>

          <div className="grid-bg trad-hero-visual" style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CubesatSchematic width={schW} height={schH}/>
            <div style={{position:'absolute', top:18, left:24}}>
              <CoordReadout>
                <span>DWG 0420-003 REV C</span>
                <span style={{color:'var(--cyan)'}} className="blink">●</span>
                <span>LIVE</span>
              </CoordReadout>
            </div>
            <div style={{position:'absolute', bottom:18, right:24}}>
              <CoordReadout>
                <span>SEL · TR-1042 · OPTIMAL</span>
              </CoordReadout>
            </div>
            <div style={{position:'absolute', bottom:18, left:24}}>
              <CoordReadout>
                <span>SCALE 1 : 4 · ISO 30°</span>
              </CoordReadout>
            </div>
          </div>
        </div>
        <BottomTicker/>
      </section>

      {/* SECTION · TRADE SPACE */}
      <section id="trade" data-screen-label="02 Trade space" style={{ padding:'var(--secPadY) var(--padX)' }}>
        <SectionHd
          fig="FIG. 02"
          kicker="LIVE TRADE SPACE"
          title="Walk the Pareto front of mass, power, and cost."
          sub="Every dot is a complete CubeSat — sized by inverse cost, filled if it dominates everything cheaper, lighter and more capable. Click any point to inspect its bill of materials and requirement coverage."
        />
        <div className="trad-grid-trade" style={{ gap:24 }}>
          <ParetoChart width={paretoW} height={520} onSelect={setSelPoint} selectedId={selPoint?.id}/>
          <ParetoDetails point={selPoint} onClose={()=>setSelPoint(null)}/>
        </div>
        {/* secondary band — requirement filters */}
        <div className="trad-4col" style={{gap:1, background:'var(--line)', border:'1px solid var(--line)', marginTop:32}}>
          {[
            { k:'CONSTRAINT', v:'BUS = 3U · ORBIT SSO 500km' },
            { k:'OBJECTIVE',  v:'min(cost) · min(mass) · max(power_margin)' },
            { k:'SOLVER',     v:'NSGA-III · pop 256 · gen 36' },
            { k:'STATUS',     v:'CONVERGED · ε=0.012' },
          ].map((s,i)=>(
            <div key={i} style={{ background:'var(--bg)', padding:'12px 14px' }}>
              <div className="lbl" style={{marginBottom:4}}>{s.k}</div>
              <div style={{fontSize:12, color:'var(--fg)'}}>{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider label="003"/>

      {/* SECTION · COMPONENT DATABASE */}
      <section id="db" data-screen-label="03 Components" style={{ padding:'var(--secPadY) var(--padX)' }}>
        <SectionHd
          fig="FIG. 03"
          kicker="COMPONENT DATABASE"
          title="A curated catalog of flight-heritage and emerging CubeSat parts."
          sub="4 218 SKUs across EPS, ADCS, OBC, COMMS, propulsion, payload, structure and thermal — each tagged with mass, power, TRL, qualification, vendor, and price. Constraints from your requirements prune candidates before the optimizer ever runs."
        />
        <ComponentsDB/>
      </section>

      <Divider label="004"/>

      {/* SECTION · HOW IT WORKS */}
      <section id="how" data-screen-label="04 How it works" style={{ padding:'var(--secPadY) var(--padX)' }}>
        <SectionHd
          fig="FIG. 04"
          kicker="METHOD"
          title="Four steps from a requirements doc to a flyable architecture."
        />
        <div className="trad-4col" style={{ gap:18 }}>
          {[
            { n:'01', t:'INGEST', d:'Drop a requirements doc, a SysML model, or a YAML spec. Trad extracts top-level performance, mass, power, orbit and link constraints.' },
            { n:'02', t:'EXPLORE', d:'The solver enumerates feasible component combinations across all subsystems, propagating mass, power, thermal and link budgets at each step.' },
            { n:'03', t:'CONVERGE', d:'NSGA-III walks the Pareto front of your objectives — mass, cost, power margin, ΔV — until the population stabilises.' },
            { n:'04', t:'EXPORT', d:'Pick a design. Export the IBD, BDD and parametrics as SysML 1.6, a Cameo-importable file, or a bill of materials in CSV.' },
          ].map(s => (
            <div key={s.n} className="brk" style={{ position:'relative', border:'1px solid var(--line)', background:'var(--bg2)', padding:24, minHeight:220, display:'flex', flexDirection:'column', gap:14 }}>
              <span style={{position:'absolute',top:-1,left:-1,width:10,height:10,borderTop:'1px solid var(--cyan)',borderLeft:'1px solid var(--cyan)'}}/>
              <span style={{position:'absolute',top:-1,right:-1,width:10,height:10,borderTop:'1px solid var(--cyan)',borderRight:'1px solid var(--cyan)'}}/>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span style={{color:'var(--cyan)', fontSize:24, fontWeight:600}}>{s.n}</span>
                <Crosshair color="var(--lineHi)" size={14}/>
              </div>
              <div className="lbl-fg" style={{fontSize:12, letterSpacing:'.14em'}}>{s.t}</div>
              <div style={{color:'var(--dim)', fontSize:12.5, lineHeight:1.6}}>{s.d}</div>
            </div>
          ))}
        </div>

        {/* MBSE detail */}
        <div className="trad-grid-2col" style={{ marginTop:36, gap:24, border:'1px solid var(--line)', background:'var(--bg2)' }}>
          <div style={{ padding:'28px 32px' }}>
            <div className="lbl-purp" style={{marginBottom:10}}>FIG. 04.5 · MBSE INTEGRATION</div>
            <h3 style={{margin:'0 0 12px', fontSize:22, fontWeight:600, lineHeight:1.2}}>
              Every Trad design round-trips through a real SysML model — no spreadsheets, no PDFs.
            </h3>
            <p style={{margin:0, color:'var(--dim)', fontSize:13, lineHeight:1.65}}>
              The optimizer talks to the same internal-block diagram you'd hand off to
              Cameo or Capella. Requirements are first-class, parametrics are evaluated
              at every iteration, and exports are deterministic — same inputs, same model.
            </p>
            <ul style={{marginTop:18, padding:0, listStyle:'none', display:'grid', gap:8, color:'var(--fg)', fontSize:12.5}}>
              {[
                'Round-trip with Cameo Systems Modeler · Capella · Rhapsody',
                'Requirements traceability down to part·revision',
                'Parametric solver in-loop — no manual rebudgeting',
                'STK / GMAT ephemerides for link-budget closure',
              ].map((x,i)=>(
                <li key={i} style={{display:'flex', gap:10}}>
                  <span style={{color:'var(--cyan)'}}>▸</span>{x}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid-bg" style={{ borderLeft:'1px solid var(--line)', padding:28, display:'flex', justifyContent:'center', alignItems:'center', minHeight:380 }}>
            <MBSEDiagram width={mbseW} height={320}/>
          </div>
        </div>
      </section>

      <Divider label="005"/>

      {/* SECTION · CASE STUDY */}
      <section id="case" data-screen-label="05 Case study" style={{ padding:'var(--secPadY) var(--padX)' }}>
        <SectionHd
          fig="FIG. 05"
          kicker="SAMPLE MISSION"
          title='"AURORA-7" — a 6U thermal-imaging constellation.'
          sub="A research group at a mid-size university used Trad to explore 8 142 candidate architectures for a six-satellite MWIR wildfire constellation. The lifeline below shows the run."
        />
        <CaseStudy/>
      </section>

      <Divider label="006"/>

      {/* SECTION · SIGN UP */}
      <section id="signup" data-screen-label="06 Signup" style={{ padding:'var(--secPadY) var(--padX) 56px' }}>
        <SignupBlock/>
      </section>

      <Footer/>
    </div>
  );
}


// ── divider ────────────────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{padding:'0 var(--padX)'}}>
      <div className="divider">
        <span>SEC · {label}</span>
      </div>
    </div>
  );
}


// ── case study ─────────────────────────────────────────────────────────────
function CaseStudy() {
  const stages = [
    { t:'REQUIREMENTS', d:'GSD ≤ 50m · revisit ≤ 90min · L1 image budget ≤ 18kg · per-sat cost ≤ $850K' },
    { t:'CANDIDATES',   d:'8 142 architectures across 3U, 6U, 12U buses · 11 payload SKUs · 4 comms options' },
    { t:'FEASIBLE',     d:'412 closed mass+power+link · 38 also met thermal · 12 also met cost' },
    { t:'SELECTED',     d:'TR-AUR-007 · 6U · 7.2kg · 24W · $612K · GSD 42m · revisit 78min' },
  ];
  return (
    <div>
      <div className="trad-grid-case" style={{ gap:24 }}>
        <div className="brk" style={{ position:'relative', border:'1px solid var(--line)', background:'var(--bg2)', padding:28 }}>
          <span style={{position:'absolute',top:-1,left:-1,width:10,height:10,borderTop:'1px solid var(--purple)',borderLeft:'1px solid var(--purple)'}}/>
          <span style={{position:'absolute',top:-1,right:-1,width:10,height:10,borderTop:'1px solid var(--purple)',borderRight:'1px solid var(--purple)'}}/>
          <span style={{position:'absolute',bottom:-1,left:-1,width:10,height:10,borderBottom:'1px solid var(--purple)',borderLeft:'1px solid var(--purple)'}}/>
          <span style={{position:'absolute',bottom:-1,right:-1,width:10,height:10,borderBottom:'1px solid var(--purple)',borderRight:'1px solid var(--purple)'}}/>
          <div className="lbl-purp" style={{marginBottom:14}}>CASE · TRAD-CS-AUR07</div>

          {/* lifeline */}
          <div style={{position:'relative'}}>
            <div style={{position:'absolute', top:14, left:14, bottom:14, width:1, background:'var(--purple)', opacity:.4}}/>
            {stages.map((s,i)=>(
              <div key={i} style={{display:'grid', gridTemplateColumns:'28px 130px 1fr 100px', alignItems:'flex-start', gap:14, padding:'14px 0', borderBottom: i<stages.length-1?'1px dotted var(--line)':'0'}}>
                <span style={{width:14, height:14, border:'2px solid var(--purple)', background:i===stages.length-1?'var(--purple)':'var(--bg)', borderRadius:'50%', marginTop:2}}/>
                <span className="lbl-purp" style={{fontSize:11.5, paddingTop:1}}>STAGE {i+1} · {s.t}</span>
                <span style={{fontSize:13, color:'var(--fg)', lineHeight:1.55}}>{s.d}</span>
                <span style={{fontSize:11, color:'var(--dim)', textAlign:'right'}}>
                  {['T+0', 'T+8s', 'T+1m 04s', 'T+2m 51s'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid', gridTemplateRows:'auto 1fr', gap:18}}>
          <div className="card">
            <div className="card-hd">
              <span className="lbl-cyan">SELECTED · TR-AUR-007</span>
              <span className="lbl">6U / MWIR</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 18px', fontSize:12.5}}>
              <Stat k="MASS"    v="7.20 kg"/>
              <Stat k="POWER"   v="24.0 W"/>
              <Stat k="COST"    v="$612K"/>
              <Stat k="GSD"     v="42 m"/>
              <Stat k="REVISIT" v="78 min"/>
              <Stat k="LINK"    v="X 200 Mb/s"/>
              <Stat k="ΔV"      v="22 m/s"/>
              <Stat k="LIFE"    v="3.4 yr"/>
            </div>
          </div>
          <div className="card" style={{display:'flex', flexDirection:'column', gap:10}}>
            <div className="card-hd">
              <span className="lbl-cyan">CONSTELLATION</span>
              <span className="lbl">N = 6</span>
            </div>
            <ConstellationDiagram/>
          </div>
        </div>
      </div>

      <div className="trad-4col" style={{ gap:1, background:'var(--line)', border:'1px solid var(--line)', marginTop:32 }}>
        {[
          ['ARCHITECTURES EXPLORED', '8 142'],
          ['HOURS · ENGINEER',       '11 h'],
          ['HOURS · TRAD',           '00 h 04 m'],
          ['COST DELTA · vs BASELINE','−38%'],
        ].map(([k,v],i)=>(
          <div key={i} style={{background:'var(--bg)', padding:'14px 16px'}}>
            <div className="lbl" style={{marginBottom:6}}>{k}</div>
            <div style={{fontSize:20, fontWeight:600, color: i===3 || i===2?'var(--cyan)':'var(--fg)'}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tiny SVG: 6 satellites on an orbit
function ConstellationDiagram() {
  const R = 76;
  const cx = 110, cy = 86;
  const sats = Array.from({length:6}, (_,i)=>{
    const a = (i/6) * Math.PI*2 - Math.PI/2;
    return { x: cx + Math.cos(a)*R, y: cy + Math.sin(a)*R };
  });
  return (
    <svg viewBox="0 0 220 172" style={{display:'block', width:'100%', maxHeight:200}}>
      <ellipse cx={cx} cy={cy} rx={R} ry={R*0.42} fill="none" stroke="var(--purple)" strokeDasharray="2 4" strokeWidth=".8"/>
      <ellipse cx={cx} cy={cy} rx={R*0.55} ry={R*0.55*0.42} fill="none" stroke="var(--line)" strokeWidth=".5"/>
      <circle cx={cx} cy={cy} r="18" fill="var(--bg)" stroke="var(--lineHi)"/>
      <text x={cx} y={cy+3} textAnchor="middle" fontSize="9" fill="var(--dim)" fontFamily="JetBrains Mono">EARTH</text>
      {sats.map((s,i)=>(
        <g key={i}>
          <rect x={s.x-3} y={s.y-3} width="6" height="6" fill="var(--cyan)"/>
          <text x={s.x} y={s.y-7} textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="var(--dim)">A-{i+1}</text>
        </g>
      ))}
    </svg>
  );
}


// ── signup ────────────────────────────────────────────────────────────────
function SignupBlock() {
  const [email, setEmail] = useStateL('');
  const [submitted, setSubmitted] = useStateL(false);
  const [error, setError] = useStateL('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      setError('PLEASE ENTER A VALID WORK EMAIL');
      return;
    }

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: "03cdbaa7-5731-46f6-9783-3754725f7fa8",
        email: email
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setSubmitted(true);
      } else {
        setError('SUBMISSION FAILED. TRY AGAIN.');
      }
    })
    .catch(err => {
      setError('NETWORK ERROR.');
    });
  };

  return (
    <div className="brk" style={{position:'relative', border:'1px solid var(--lineHi)', padding:'56px 48px', background:'var(--bg2)'}}>
      <span style={{position:'absolute',top:-1,left:-1,width:14,height:14,borderTop:'1px solid var(--cyan)',borderLeft:'1px solid var(--cyan)'}}/>
      <span style={{position:'absolute',top:-1,right:-1,width:14,height:14,borderTop:'1px solid var(--cyan)',borderRight:'1px solid var(--cyan)'}}/>
      <span style={{position:'absolute',bottom:-1,left:-1,width:14,height:14,borderBottom:'1px solid var(--cyan)',borderLeft:'1px solid var(--cyan)'}}/>
      <span style={{position:'absolute',bottom:-1,right:-1,width:14,height:14,borderBottom:'1px solid var(--cyan)',borderRight:'1px solid var(--cyan)'}}/>

      <div className="trad-grid-signup" style={{gap:48, alignItems:'center'}}>
        <div>
          <div className="lbl-cyan" style={{marginBottom:12}}>FIG. 06 · CLOSED BETA · 2026 Q3</div>
          <h2 style={{margin:'0 0 14px', fontSize:'var(--h1)', lineHeight:1.04, fontWeight:600, letterSpacing:'-.01em'}}>
            We're letting in the<br/>first fifty teams.
          </h2>
          <p style={{margin:0, color:'var(--dim)', maxWidth:520, fontSize:13.5, lineHeight:1.6}}>
            Trad is in closed beta with a handful of university labs and small commercial
            programs. Drop your email and we'll reach out when a seat opens up.
          </p>
        </div>

        <form onSubmit={handleFormSubmit}
              style={{display:'flex', flexDirection:'column', gap:12}}>
          
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
            <label className="lbl-fg">WORK EMAIL</label>
            {error && <span style={{color:'#f78c6c', fontSize:10, fontWeight:600, letterSpacing:'.08em'}}>{error}</span>}
          </div>

          <div style={{display:'flex'}}>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="systems@yourlab.edu"
              style={{flex:1, padding:'14px 16px', background:'var(--bg)', border: error ? '1px solid #f78c6c' : '1px solid var(--lineHi)', color:'var(--fg)', font:'inherit', fontSize:14, outline:'none', borderRight: error ? '1px solid #f78c6c' : 'none'}}
            />
            <button type="submit"
                    style={{padding:'0 22px', background:'var(--cyan)', border:'1px solid var(--cyan)', color:'#031319', font:'inherit', cursor:'pointer', fontWeight:600, fontSize:12, letterSpacing:'.08em'}}>
              {submitted ? 'YOU ARE IN' : 'NOTIFY ME'}
            </button>
          </div>
          
          <div style={{display:'flex', gap:16, color:'var(--dim)', fontSize:11}}>
            <span><span style={{color:'var(--cyan)'}}>●</span> No spam. One launch email.</span>
            <span><span style={{color:'var(--cyan)'}}>●</span> Small teams & academic priority.</span>
          </div>
        </form>
      </div>
    </div>
  );
}


// ── footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop:'1px solid var(--line)', padding:'40px var(--padX) 28px', marginTop:24 }}>
      <div className="trad-grid-foot" style={{gap:32, marginBottom:36}}>
        <div>
          <Wordmark/>
          <p style={{marginTop:14, color:'var(--dim)', fontSize:12, lineHeight:1.6, maxWidth:280}}>
            A Frontier Express product.<br/>
            Trade space exploration for CubeSat-only architectures.
          </p>
        </div>
        <FooterCol title="PRODUCT" items={['Trade space', 'Component DB', 'MBSE export', 'CLI · SDK', 'Pricing']}/>
        <FooterCol title="RESOURCES" items={['Documentation', 'Component catalog', 'Methods paper', 'Changelog', 'Status']}/>
        <FooterCol title="COMPANY" items={['Frontier Express', 'Open roles', 'Press kit', 'Contact', 'hello@frontier.express']}/>
      </div>
      <div className="trad-footer-bot" style={{paddingTop:18, borderTop:'1px solid var(--line)', color:'var(--dim)', fontSize:11, letterSpacing:'.12em'}}>
        <span>© 2026 FRONTIER EXPRESS · TRAD V0.9 · CLOSED BETA</span>
        <span><Clock/></span>
        <span>BUILD 04A82.f31c · NODE us-west-2 · <span style={{color:'var(--cyan)'}}>●</span> ONLINE</span>
      </div>
    </footer>
  );
}
function FooterCol({ title, items }) {
  return (
    <div>
      <div className="lbl" style={{marginBottom:14}}>{title}</div>
      <ul style={{margin:0, padding:0, listStyle:'none', display:'grid', gap:8}}>
        {items.map(i => <li key={i} style={{fontSize:12.5, color:'var(--fg)'}}>{i}</li>)}
      </ul>
    </div>
  );
}

// helper used by case study
function Stat({ k, v }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',gap:8,borderBottom:'1px dotted var(--line)',padding:'4px 0'}}>
      <span style={{color:'var(--dim)', fontSize:10.5, letterSpacing:'.12em'}}>{k}</span>
      <span style={{color:'var(--fg)'}}>{v}</span>
    </div>
  );
}

Object.assign(window, { LandingPage, Footer, SignupBlock, CaseStudy });
