/**
 * App — composição da tela e os três modos:
 *   "livre"    → simulação livre com todos os controles
 *   "tour"     → "Como funciona?" (5 etapas guiadas)
 *   "explorar" → "Explorar estrutura" (componentes + desmontar/montar)
 *
 * Layout: cabeçalho institucional / controles | palco 3D | telemetria.
 * A lógica de simulação continua toda em useTurbineSimulation.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Wind, Compass, Boxes, HelpCircle, X, MousePointer2, Move3d } from 'lucide-react';
import { MainScene } from './scenes/MainScene';
import { ControlPanel } from './components/ControlPanel';
import { Indicators } from './components/Indicators';
import { ExplanationPanel, TourPanel, ExplorePanel } from './components/ExplanationPanel';
import { BrandLogo } from './components/BrandLogo';
import { IntroSplash } from './components/IntroSplash';
import { useTurbineSimulation } from './hooks/useTurbineSimulation';
import { TOUR } from './data/content';

const TOUR_STEP_MS = 8000;
const CAMERA_HOME = { pos: [5.6, 3.9, 7.4], target: [0.4, 1.9, 0] };

// Peças destacadas em cada etapa do roteiro
const TOUR_HIGHLIGHT = [['vento'], ['pas'], ['eixo', 'transmissao'], ['gerador'], ['cabos', 'lampada']];

const MODES = [
  { id: 'livre', label: 'Simulação livre', icon: Wind },
  { id: 'tour', label: 'Como funciona?', icon: Compass },
  { id: 'explorar', label: 'Explorar estrutura', icon: Boxes },
];

/** Estado geral mostrado no cabeçalho — derivado dos valores reais. */
function simStatus(controls, readout) {
  if (controls.paused) return { key: 'pausado', text: 'Simulação pausada' };
  if (readout.power > 0.05) return { key: 'gerando', text: 'Gerando energia' };
  if (readout.rpm > 0.5) return { key: 'girando', text: 'Rotor girando' };
  if (readout.wind > 0.1) return { key: 'vento', text: 'Vento ativo' };
  return { key: 'repouso', text: 'Em repouso' };
}

export default function App() {
  const { controls, set, readout, sim, step, reset } = useTurbineSimulation();

  const [introDone, setIntroDone] = useState(false);
  const [mode, setMode] = useState('livre');
  const [selected, setSelected] = useState(null);
  const [tourStep, setTourStep] = useState(0);
  const [tourAuto, setTourAuto] = useState(true);
  const [tourKey, setTourKey] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [help, setHelp] = useState(true);
  const orbitRef = useRef();

  // ---- "Como funciona?": cada etapa ajusta a simulação ----
  useEffect(() => {
    if (mode !== 'tour') return;
    if (tourStep === 0) set((c) => ({ windOn: true, windLevel: Math.max(c.windLevel, 65), turbineOn: false, paused: false }));
    else set({ windOn: true, turbineOn: true, paused: false });
  }, [mode, tourStep, tourKey, set]);

  // Avanço automático
  useEffect(() => {
    if (mode !== 'tour' || !tourAuto || tourStep >= TOUR.length - 1) return;
    const t = setTimeout(() => setTourStep((s) => s + 1), TOUR_STEP_MS);
    return () => clearTimeout(t);
  }, [mode, tourAuto, tourStep, tourKey]);

  const repeatTour = useCallback(() => {
    reset();
    setTourStep(0);
    setTourAuto(true);
    setTourKey((k) => k + 1);
  }, [reset]);

  const changeMode = (m) => {
    setMode(m);
    setSelected(null);
    if (m !== 'explorar') setExploded(false);
    if (m === 'tour') repeatTour();
  };

  // ---- Destaques na cena ----
  const highlight = useMemo(() => {
    if (mode === 'tour') return TOUR_HIGHLIGHT[tourStep];
    return selected ? [selected] : [];
  }, [mode, tourStep, selected]);

  const select = useCallback((id) => setSelected(id), []);

  const recenter = useCallback(() => {
    const c = orbitRef.current;
    if (!c) return;
    c.object.position.set(...CAMERA_HOME.pos);
    c.target.set(...CAMERA_HOME.target);
    c.update();
  }, []);

  // Esc fecha explicação/ajuda
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelected(null);
        setHelp(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ---- Indicador deslizante do seletor de modos ----
  const modeRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const el = modeRefs.current[mode];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [mode, introDone]);

  const status = simStatus(controls, readout);
  const dockOpen = mode === 'tour' || !!selected;
  const onIntroDone = useCallback(() => setIntroDone(true), []);

  return (
    <>
      {!introDone && <IntroSplash onDone={onIntroDone} />}

      <div className={`app ${introDone ? 'is-ready' : ''}`} style={{ '--energy': readout.brightness }}>
        {/* ================= CABEÇALHO ================= */}
        <header className="app-header">
          <div className="identity">
            <BrandLogo sim={sim} />
            <div className="identity-text">
              <span className="school-name">PEI Ary Gomes</span>
              <span className="school-sub">Feira de Ciências</span>
            </div>
          </div>
          <span className="divider-v" aria-hidden="true" />
          <div className="project-title">
            <h1>Turbina Eólica Savonius</h1>
            <span>Simulação educacional 3D</span>
          </div>

          <nav className="mode-switch" aria-label="Modos">
            <span className="mode-indicator" style={{ left: pill.left, width: pill.width }} aria-hidden="true" />
            {MODES.map(({ id, label, icon: Icon }) => (
              <button key={id} ref={(el) => (modeRefs.current[id] = el)} onClick={() => changeMode(id)} aria-pressed={mode === id}>
                <Icon size={16} /> <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sim-status" data-state={status.key} role="status" aria-live="polite">
            <span className="status-dot" aria-hidden="true" />
            <span className="label">{status.text}</span>
          </div>
          <button className="icon-btn" onClick={() => setHelp(true)} aria-label="Como usar">
            <HelpCircle size={19} />
          </button>
        </header>

        {/* ================= CONTROLES ================= */}
        <ControlPanel controls={controls} set={set} reset={mode === 'tour' ? repeatTour : reset} onRecenter={recenter} locked={mode === 'tour'} readout={readout} />

        {/* ================= PALCO 3D ================= */}
        <main className="stage">
          <div className="canvas-wrap">
            <MainScene
              sim={sim}
              step={step}
              controls={controls}
              highlight={highlight}
              selected={selected}
              select={select}
              dim={mode === 'explorar' && !!selected}
              explodeTarget={exploded ? 1 : 0}
              orbitRef={orbitRef}
            />
            <div className="stage-hint" aria-hidden="true">
              <span>
                <Move3d size={15} /> Arraste para girar · role para zoom
              </span>
              <span>
                <MousePointer2 size={15} /> Clique numa peça
              </span>
            </div>
            <div className="stage-corner" aria-hidden="true">
              {mode === 'tour' ? `ETAPA ${tourStep + 1}/5` : mode === 'explorar' ? (exploded ? 'VISTA EXPLODIDA' : 'VISTA MONTADA') : 'MODO LIVRE'}
              <br />×{String(controls.simSpeed).replace('.', ',')} {controls.xray ? '· RAIO-X' : ''}
            </div>
          </div>

          <div className={`dock ${dockOpen ? 'is-open' : ''}`}>
            <div className="dock-inner">
              {mode === 'tour' ? (
                <TourPanel step={tourStep} setStep={setTourStep} auto={tourAuto} setAuto={setTourAuto} onRepeat={repeatTour} stepMs={TOUR_STEP_MS} />
              ) : (
                <ExplanationPanel id={selected} onClose={() => setSelected(null)} />
              )}
            </div>
          </div>
        </main>

        {/* ================= TELEMETRIA ================= */}
        <aside className="col-info">
          <Indicators readout={readout} sim={sim} />
          {mode === 'explorar' && <ExplorePanel selected={selected} select={select} exploded={exploded} setExploded={setExploded} />}
        </aside>
      </div>

      {introDone && help && (
        <div className="help-backdrop" onClick={() => setHelp(false)}>
          <div className="help" role="dialog" aria-modal="true" aria-label="Como usar" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setHelp(false)} aria-label="Fechar ajuda">
              <X size={18} />
            </button>
            <h2>Como usar</h2>
            <ol>
              <li>
                <span>
                  Em <b>Vento</b>, clique em <b>Iniciar</b> e ajuste a intensidade.
                </span>
              </li>
              <li>
                <span>
                  Em <b>Turbina</b>, clique em <b>Iniciar turbina</b> e veja a lâmpada acender.
                </span>
              </li>
              <li>
                <span>
                  Arraste a cena para <b>girar</b>; role ou faça pinça para <b>zoom</b>.
                </span>
              </li>
              <li>
                <span>
                  <b>Clique numa peça</b> ou num marcador para ler a explicação.
                </span>
              </li>
              <li>
                <span>
                  Experimente <b>Como funciona?</b> e <b>Explorar estrutura</b>.
                </span>
              </li>
            </ol>
            <button className="btn primary" onClick={() => setHelp(false)}>
              Começar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
