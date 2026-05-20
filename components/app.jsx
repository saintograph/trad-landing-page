// app.jsx — top-level: design canvas + tweaks

const { useState: useStateA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "dark",
  "density": "regular"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <div style={{ minHeight:'100vh' }}>
      <ThemeStyle mode={t.mode} density={t.density}/>
      <TradStyles/>

      <DesignCanvas>
        <DCSection id="heroes" title="Hero variations" subtitle="Three takes on the above-the-fold for Trad — schematic-led, data-led, and CLI-led.">
          <DCArtboard id="hero-a" label="A · Schematic" width={1280} height={720}>
            <HeroSchematic width={1280} height={720}/>
          </DCArtboard>
          <DCArtboard id="hero-b" label="B · Pareto" width={1280} height={720}>
            <HeroData width={1280} height={720}/>
          </DCArtboard>
          <DCArtboard id="hero-c" label="C · Terminal" width={1280} height={720}>
            <HeroTerminal width={1280} height={720}/>
          </DCArtboard>
        </DCSection>

        <DCSection id="landing" title="Full landing page" subtitle="Hero A composed with the Pareto demo, component database, method, case study, and signup. Open fullscreen to interact end-to-end.">
          <DCArtboard id="full" label="Trad · Landing v1" width={1440} height={4500}>
            <LandingPage width={1440}/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme"/>
        <TweakRadio label="Mode" value={t.mode}
                    options={['dark','light']}
                    onChange={v=>setTweak('mode', v)}/>
        <TweakRadio label="Density" value={t.density}
                    options={['compact','regular']}
                    onChange={v=>setTweak('density', v)}/>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
