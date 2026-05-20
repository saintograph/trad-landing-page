// components-db.jsx — component database table + showcase

const { useState: useStateC, useMemo: useMemoC } = React;

const COMPONENTS = [
  // Power
  { pn:'PV-300-XR',   sub:'POWER',   name:'30W Deployable Solar Array',  vendor:'AstroHelio',  mass:0.42, p_in:30,   p_out:null, tdp:'-40..+85',  trl:9, qual:'CE-101', price:18.5,  dim:'250×82×6 mm' },
  { pn:'BAT-44L-IO',  sub:'POWER',   name:'44Wh Li-ion Pack',            vendor:'OrbVolt',     mass:0.34, p_in:null, p_out:44,   tdp:'-20..+60',  trl:9, qual:'V-EN-RAD',price:5.4,   dim:'93×50×34 mm' },
  { pn:'EPS-VX-7',    sub:'POWER',   name:'EPS Bus 28V/5V/3.3V',         vendor:'OrbVolt',     mass:0.21, p_in:75,   p_out:60,   tdp:'-40..+85',  trl:9, qual:'V-EN-RAD',price:11.2,  dim:'95×95×17 mm' },
  // ADCS
  { pn:'RW-15-S',     sub:'ADCS',    name:'15mNm Reaction Wheel',        vendor:'GimbalCo',    mass:0.14, p_in:1.2,  p_out:null, tdp:'-30..+70',  trl:9, qual:'V-PV',    price:8.9,   dim:'34×34×38 mm' },
  { pn:'ST-200',      sub:'ADCS',    name:'Star Tracker · 4 arcsec',     vendor:'PerseusOpt',  mass:0.28, p_in:1.0,  p_out:null, tdp:'-25..+60',  trl:8, qual:'V-VIB',   price:42.0,  dim:'56×56×88 mm' },
  { pn:'MAG-3X',      sub:'ADCS',    name:'3-axis Magnetorquer',         vendor:'SolarBoreal', mass:0.20, p_in:0.8,  p_out:null, tdp:'-40..+85',  trl:9, qual:'V-EN',    price:3.6,   dim:'94×94×22 mm' },
  // Comms
  { pn:'UHF-DI-4W',   sub:'COMMS',   name:'UHF Dipole Transceiver',      vendor:'LinkRadio',   mass:0.10, p_in:4,    p_out:null, tdp:'-30..+70',  trl:9, qual:'V-PV',    price:6.1,   dim:'94×94×14 mm' },
  { pn:'SBND-T2',     sub:'COMMS',   name:'S-Band 2W TX',                vendor:'LinkRadio',   mass:0.18, p_in:6,    p_out:null, tdp:'-30..+70',  trl:9, qual:'V-EMC',   price:14.3,  dim:'94×94×18 mm' },
  { pn:'XBND-T8',     sub:'COMMS',   name:'X-Band 8W TX · 200Mbps',      vendor:'BeamForward', mass:0.32, p_in:18,   p_out:null, tdp:'-25..+60',  trl:7, qual:'V-VIB',   price:54.0,  dim:'94×94×40 mm' },
  // OBC
  { pn:'OBC-Q7',      sub:'OBC',     name:'Quad-Core OBC · RTOS',        vendor:'Yawpine',     mass:0.09, p_in:1.5,  p_out:null, tdp:'-40..+85',  trl:9, qual:'V-RAD',   price:9.7,   dim:'94×94×12 mm' },
  // Payload
  { pn:'MWIR-640',    sub:'PAYLOAD', name:'MWIR Imager · 640×512',       vendor:'PerseusOpt',  mass:0.62, p_in:6.5,  p_out:null, tdp:'-20..+50',  trl:7, qual:'V-VIB',   price:88.0,  dim:'80×80×120 mm' },
  { pn:'SAR-X',       sub:'PAYLOAD', name:'X-Band SAR · 1m GSD',         vendor:'CardinalSAR', mass:2.10, p_in:34,   p_out:null, tdp:'-15..+45',  trl:6, qual:'V-VIB',   price:240.0, dim:'200×200×120 mm' },
  // Propulsion
  { pn:'CG-12',       sub:'PROP',    name:'Cold Gas · Δv 12 m/s',        vendor:'AthenaProp',  mass:0.55, p_in:8,    p_out:null, tdp:'-10..+55',  trl:9, qual:'V-VIB',   price:18.2,  dim:'82×82×95 mm' },
  { pn:'GIT-30',      sub:'PROP',    name:'Iodine Hall · Δv 80 m/s',     vendor:'AthenaProp',  mass:1.20, p_in:55,   p_out:null, tdp:'-10..+45',  trl:6, qual:'V-PV',    price:96.0,  dim:'100×100×135 mm' },
  // Structure / Thermal
  { pn:'STR-3U-T6',   sub:'STRUCT',  name:'3U Frame · 6061-T6',          vendor:'KestrelMech', mass:0.46, p_in:null, p_out:null, tdp:'-60..+95',  trl:9, qual:'V-VIB',   price:6.8,   dim:'100×100×340 mm' },
  { pn:'THM-LPK-2',   sub:'THERM',   name:'Heat Pipe + Radiator Kit',    vendor:'KestrelMech', mass:0.30, p_in:null, p_out:null, tdp:'-60..+95',  trl:9, qual:'V-TVAC',  price:7.5,   dim:'2× 200×40 mm' },
];

const SUBSYSTEMS = ['ALL','POWER','ADCS','COMMS','OBC','PAYLOAD','PROP','STRUCT','THERM'];

function ComponentsDB({ embedded = false }) {
  const [sub, setSub] = useStateC('ALL');
  const [q, setQ] = useStateC('');
  const [sort, setSort] = useStateC({ k:'pn', dir:1 });

  const rows = useMemoC(() => {
    let r = COMPONENTS.slice();
    if (sub !== 'ALL') r = r.filter(c => c.sub === sub);
    if (q) {
      const s = q.toLowerCase();
      r = r.filter(c => Object.values(c).some(v => String(v).toLowerCase().includes(s)));
    }
    r.sort((a,b) => {
      const av = a[sort.k], bv = b[sort.k];
      if (av == null) return 1; if (bv == null) return -1;
      if (typeof av === 'number') return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
    return r;
  }, [sub, q, sort]);

  const cols = [
    { k:'pn',     t:'PART NO.', w:110 },
    { k:'sub',    t:'SUBSYS',   w:80 },
    { k:'name',   t:'DESCRIPTION', w:'auto' },
    { k:'vendor', t:'VENDOR',   w:120 },
    { k:'mass',   t:'MASS·KG',  w:80, n:true },
    { k:'p_in',   t:'PWR·W',    w:70, n:true },
    { k:'tdp',    t:'TEMP·°C',  w:90 },
    { k:'trl',    t:'TRL',      w:60, n:true },
    { k:'price',  t:'$K',       w:60, n:true },
  ];

  return (
    <div>
      {/* control bar */}
      <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap', marginBottom:14 }}>
        <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
          {SUBSYSTEMS.map(s => (
            <button key={s} onClick={()=>setSub(s)}
              className={'chip ' + (sub===s?'on':'')} style={{cursor:'pointer'}}>
              {sub===s?'■':'□'} {s}
            </button>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8, marginLeft:'auto', border:'1px solid var(--line)', padding:'4px 8px', background:'var(--bg)'}}>
          <span className="lbl">QUERY</span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="ST-200, magnetorquer…"
                 style={{background:'transparent',border:0,outline:0,color:'var(--fg)',font:'inherit',fontSize:12,minWidth:200}}/>
          <span style={{color:'var(--dim)', fontSize:11}}>{rows.length}/{COMPONENTS.length}</span>
        </div>
      </div>

      {/* table */}
      <div style={{ border:'1px solid var(--line)', background:'var(--bg)', overflow:'hidden' }}>
        <table className="mono-tab" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c.k}
                    onClick={()=>setSort(s=> s.k===c.k? {k:c.k, dir:-s.dir} : {k:c.k, dir:1})}
                    style={{ width:c.w, cursor:'pointer', textAlign:c.n?'right':'left', whiteSpace:'nowrap', userSelect:'none', background:'var(--bg2)' }}>
                  {c.t} {sort.k===c.k && (sort.dir>0?'↑':'↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.pn}>
                {cols.map(c => (
                  <td key={c.k} style={{
                      textAlign:c.n?'right':'left',
                      color: c.k==='pn'?'var(--cyan)':(c.k==='trl'? (r.trl<8?'var(--warn)':'var(--fg)') : 'var(--fg)'),
                      whiteSpace:c.k==='name'?'normal':'nowrap',
                    }}>
                    {r[c.k] == null ? '—' : (c.k==='price' ? r[c.k].toFixed(1) : r[c.k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* totals strip */}
      <div style={{display:'flex', gap:24, padding:'10px 4px', marginTop:6, color:'var(--dim)', fontSize:11}}>
        <span>Σ MASS · {rows.reduce((a,c)=>a+(c.mass||0),0).toFixed(2)} kg</span>
        <span>Σ POWER · {rows.reduce((a,c)=>a+(c.p_in||0),0).toFixed(1)} W</span>
        <span>Σ COST · ${rows.reduce((a,c)=>a+(c.price||0),0).toFixed(1)} K</span>
        <span style={{marginLeft:'auto'}}>DB · TRAD-CAT-2026Q2 · 4 218 SKU TOTAL</span>
      </div>
    </div>
  );
}

Object.assign(window, { ComponentsDB, COMPONENTS });
