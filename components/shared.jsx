// shared.jsx — design tokens, atoms, schematic primitives

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─── tokens ─────────────────────────────────────────────────────────────────

const TOKENS = {
  dark: {
    bg:    '#0a0a0a',
    bg2:   '#121212',
    bg3:   '#181818',
    fg:    '#e8e8e8',
    dim:   '#8a8a8a',
    dimmer:'#5a5a5a',
    line:  '#262626',
    lineHi:'#3a3a3a',
    cyan:  '#22d3ee',
    cyanDim:'#0e7490',
    purple:'#a855f7',
    purpleDim:'#6b21a8',
    warn:  '#fbbf24',
  },
  light: {
    bg:    '#efece4',
    bg2:   '#f6f3eb',
    bg3:   '#fbf9f3',
    fg:    '#0e0e0e',
    dim:   '#5c5c5c',
    dimmer:'#9a958b',
    line:  '#cdc7b8',
    lineHi:'#a8a195',
    cyan:  '#0e7490',
    cyanDim:'#22d3ee',
    purple:'#7e22ce',
    purpleDim:'#a855f7',
    warn:  '#b45309',
  },
};

const DENSITY = {
  compact: { padY: 56, padX: 28, gap: 18, sectionPadY: 80, h1: 56, h2: 30, body: 13 },
  regular: { padY: 96, padX: 40, gap: 24, sectionPadY: 128, h1: 72, h2: 36, body: 14 },
};

// rendered as inline <style> on each consumer scope. Variables only — no rules.
function ThemeStyle({ mode = 'dark', density = 'regular' }) {
  const t = TOKENS[mode];
  const d = DENSITY[density];
  const css = `
    :root, .trad-scope{
      --bg:${t.bg}; --bg2:${t.bg2}; --bg3:${t.bg3};
      --fg:${t.fg}; --dim:${t.dim}; --dimmer:${t.dimmer};
      --line:${t.line}; --lineHi:${t.lineHi};
      --cyan:${t.cyan}; --cyanDim:${t.cyanDim};
      --purple:${t.purple}; --purpleDim:${t.purpleDim};
      --warn:${t.warn};
      --padY:${d.padY}px; --padX:${d.padX}px; --gap:${d.gap}px;
      --secPadY:${d.sectionPadY}px;
      --h1:${d.h1}px; --h2:${d.h2}px; --body:${d.body}px;
    }
  `;
  return <style>{css}</style>;
}

// ─── shared CSS (atoms used by every section) ───────────────────────────────
const TRAD_CSS = `
.trad-scope{
  font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;
  color:var(--fg); background:var(--bg);
  font-size:var(--body); line-height:1.55;
  letter-spacing:.01em;
}
.trad-scope a{ color:inherit; text-decoration:none }
.trad-scope button{ font:inherit; color:inherit }
.trad-scope ::selection{ background:var(--cyan); color:var(--bg) }

/* grid background — engineering drafting paper */
.grid-bg{
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: -1px -1px;
}
.grid-bg-fine{
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px),
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 96px 96px, 96px 96px, 12px 12px, 12px 12px;
  background-color: var(--bg);
}

/* faded scanline overlay for monitor feel */
.scanlines{position:relative}
.scanlines::after{
  content:''; position:absolute; inset:0; pointer-events:none;
  background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.015) 0 1px, transparent 1px 3px);
  mix-blend-mode: overlay;
}

/* corner brackets — a la engineering callouts */
.brk{ position:relative }
.brk::before, .brk::after,
.brk > .brk-tl, .brk > .brk-tr, .brk > .brk-bl, .brk > .brk-br {
  position:absolute; width:10px; height:10px; border:1px solid var(--lineHi); content:'';
}
.brk > .brk-tl{ top:-1px; left:-1px; border-right:0; border-bottom:0 }
.brk > .brk-tr{ top:-1px; right:-1px; border-left:0; border-bottom:0 }
.brk > .brk-bl{ bottom:-1px; left:-1px; border-right:0; border-top:0 }
.brk > .brk-br{ bottom:-1px; right:-1px; border-left:0; border-top:0 }
.brk::before, .brk::after{ display:none }

/* mono-cap label */
.lbl{ font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); font-weight:500 }
.lbl-fg{ font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--fg); font-weight:500 }
.lbl-cyan{ font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--cyan); font-weight:600 }
.lbl-purp{ font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--purple); font-weight:600 }

/* numeric badge */
.numtag{ display:inline-flex; align-items:center; gap:6px; padding:3px 8px; border:1px solid var(--line); color:var(--dim); font-size:11px; line-height:1; background:var(--bg) }
.numtag .dot{ width:5px; height:5px; background:var(--cyan); display:inline-block }

/* button */
.btn{ display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border:1px solid var(--fg); background:transparent; color:var(--fg); cursor:pointer; font-size:12px; letter-spacing:.06em; text-transform:uppercase; transition:background .15s,color .15s }
.btn:hover{ background:var(--fg); color:var(--bg) }
.btn-pri{ background:var(--cyan); border-color:var(--cyan); color:#031319 }
.btn-pri:hover{ background:var(--fg); border-color:var(--fg); color:var(--bg) }
.btn-sm{ padding:6px 10px; font-size:10.5px }

/* card */
.card{ border:1px solid var(--line); background:var(--bg2); padding:18px }
.card-hd{ display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--line); padding-bottom:8px; margin-bottom:14px }

/* hr + divider with label */
.hr{ height:1px; background:var(--line); margin:0; border:0 }
.divider{ display:flex; align-items:center; gap:10px; color:var(--dim); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase }
.divider::before, .divider::after{ content:''; flex:1; height:1px; background:var(--line) }

/* helpers */
.row{ display:flex; align-items:center }
.col{ display:flex; flex-direction:column }
.muted{ color:var(--dim) }
.mono-tab th, .mono-tab td{ text-align:left; font-weight:400; padding:8px 12px; border-bottom:1px solid var(--line); font-size:12px }
.mono-tab thead th{ color:var(--dim); font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; border-bottom:1px solid var(--lineHi) }
.mono-tab tbody tr:hover{ background:var(--bg2) }

/* blink */
@keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
.blink{ animation: blink 1s steps(1) infinite }

/* technical chip */
.chip{ display:inline-flex; align-items:center; gap:6px; padding:2px 6px; border:1px solid var(--line); font-size:10px; color:var(--dim); background:var(--bg) }
.chip.on{ color:var(--cyan); border-color:var(--cyan) }
.chip.purp{ color:var(--purple); border-color:var(--purple) }

/* corner ticks utility */
.ticks{ position:relative }
.ticks > svg.t{ position:absolute; pointer-events:none }

/* ── responsive layout helpers ──────────────────────────────────────────────
   Grid columns live here (not inline) so media queries can override them.
   gap / border / padding / etc. stay in inline styles.                        */
.trad-scope{ width:100% }

/* svg scaling — viewBox keeps proportions correct */
.trad-scope svg{ max-width:100%; height:auto }

/* named grids */
.trad-grid-hero   { display:grid; grid-template-columns:1fr 1fr }
.trad-hero-copy   { padding:88px 64px 64px; display:flex; flex-direction:column; justify-content:center; gap:28px }
.trad-hero-visual { min-height:640px; border-left:1px solid var(--line) }
.trad-grid-trade  { display:grid; grid-template-columns:1.6fr 1fr }
.trad-4col        { display:grid; grid-template-columns:repeat(4,1fr) }
.trad-grid-2col   { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); align-items:center }
.trad-grid-case   { display:grid; grid-template-columns:2.1fr 1fr }
.trad-grid-signup { display:grid; grid-template-columns:1.2fr 1fr }
.trad-grid-foot   { display:grid; grid-template-columns:repeat(4,1fr) }
.trad-footer-bot  { display:flex; justify-content:space-between; align-items:center }

/* ── 1024px — tablet/laptop ─────────────────────────────────────────────── */
@media (max-width:1024px) {
  .trad-grid-hero   { grid-template-columns:1fr }
  .trad-hero-copy   { padding:48px 28px 40px }
  .trad-hero-visual { min-height:380px; border-left:none; border-top:1px solid var(--line) }
  .trad-grid-trade  { grid-template-columns:1fr }
  .trad-4col        { grid-template-columns:1fr 1fr }
  .trad-grid-2col   { grid-template-columns:1fr }
  .trad-grid-case   { grid-template-columns:1fr }
  .trad-grid-signup { grid-template-columns:1fr; gap:28px }
  .trad-grid-foot   { grid-template-columns:1fr 1fr }
}

/* ── 640px — mobile ─────────────────────────────────────────────────────── */
@media (max-width:640px) {
  .trad-hero-copy   { padding:32px 20px 28px }
  .trad-hero-visual { min-height:240px }
  .trad-4col        { grid-template-columns:1fr }
  .trad-grid-foot   { grid-template-columns:1fr }
  .trad-footer-bot  { flex-direction:column; gap:10px; align-items:flex-start }
}
`;
function TradStyles(){ return <style>{TRAD_CSS}</style>; }


// ─── primitives ─────────────────────────────────────────────────────────────

// CornerBrackets: four 10px L-brackets around the children.
function Brackets({ children, color = 'var(--lineHi)', size = 10, style = {}, ...rest }) {
  const b = (pos) => {
    const s = { position:'absolute', width:size, height:size, ...pos };
    return <span style={s} />;
  };
  return (
    <div style={{ position:'relative', ...style }} {...rest}>
      <span style={{position:'absolute',top:-1,left:-1,width:size,height:size,borderTop:`1px solid ${color}`,borderLeft:`1px solid ${color}`}}/>
      <span style={{position:'absolute',top:-1,right:-1,width:size,height:size,borderTop:`1px solid ${color}`,borderRight:`1px solid ${color}`}}/>
      <span style={{position:'absolute',bottom:-1,left:-1,width:size,height:size,borderBottom:`1px solid ${color}`,borderLeft:`1px solid ${color}`}}/>
      <span style={{position:'absolute',bottom:-1,right:-1,width:size,height:size,borderBottom:`1px solid ${color}`,borderRight:`1px solid ${color}`}}/>
      {children}
    </div>
  );
}

// Section header — "FIG. 02 / SECTION TITLE" style
function SectionHd({ fig, kicker, title, sub, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, marginBottom:36, paddingBottom:16, borderBottom:'1px solid var(--line)' }}>
      <div style={{display:'flex', flexDirection:'column', gap:12, minWidth:0}}>
        <div className="row" style={{gap:14}}>
          <span className="lbl-cyan">{fig}</span>
          <span className="lbl">{kicker}</span>
        </div>
        <h2 style={{margin:0, fontSize:'var(--h2)', fontWeight:600, letterSpacing:'-.01em', lineHeight:1.08, maxWidth:780}}>
          {title}
        </h2>
        {sub && <p style={{margin:0, color:'var(--dim)', maxWidth:680, fontSize:13}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// Crosshair marker (decoration)
function Crosshair({ size = 16, color = 'var(--lineHi)', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={style}>
      <line x1="0" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1"/>
      <line x1="8" y1="0" x2="8" y2="16" stroke={color} strokeWidth="1"/>
      <circle cx="8" cy="8" r="2.5" fill="none" stroke={color} strokeWidth="1"/>
    </svg>
  );
}

// Small inline ascii arrow
const Arr = ({ dir = 'right' }) => {
  const c = { right:'→', left:'←', up:'↑', down:'↓' }[dir];
  return <span aria-hidden>{c}</span>;
};

// Coordinate readout (the corner ticker)
function CoordReadout({ children, style = {} }) {
  return (
    <div style={{ display:'flex', gap:14, alignItems:'center', fontSize:10.5, color:'var(--dim)', letterSpacing:'.14em', ...style }}>
      {children}
    </div>
  );
}

// Live clock readout
function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(()=>{ const id = setInterval(()=>setT(new Date()), 1000); return ()=>clearInterval(id); },[]);
  const pad = n => String(n).padStart(2,'0');
  return <span>{pad(t.getUTCHours())}:{pad(t.getUTCMinutes())}:{pad(t.getUTCSeconds())} UTC</span>;
}

// ─── exports ────────────────────────────────────────────────────────────────
Object.assign(window, {
  TOKENS, DENSITY, ThemeStyle, TradStyles,
  Brackets, SectionHd, Crosshair, Arr, CoordReadout, Clock,
});
