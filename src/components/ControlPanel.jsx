/**
 * ControlPanel — coluna de controles, organizada em grupos:
 *   01 Vento · 02 Turbina · 03 Energia · 04 Visualização
 * Todos os estados exibidos vêm da simulação real (readout/controls).
 */
import { memo } from 'react';
import { Wind, Square, Minus, Plus, Play, Pause, RotateCcw, Lock, Unlock, ScanEye, Tags, Crosshair } from 'lucide-react';
import { PHYS } from '../hooks/useTurbineSimulation';
import { lampState } from './Indicators';

const SPEEDS = [0.5, 1, 2];

function GroupHead({ index, title, state, tone }) {
  return (
    <div className="group-head">
      <span className="group-index">{index}</span>
      <h2>{title}</h2>
      {state && <span className={`state ${tone || ''}`}>{state}</span>}
    </div>
  );
}

export const ControlPanel = memo(function ControlPanel({ controls, set, reset, onRecenter, locked, readout }) {
  const lvl = controls.windLevel;
  const changeWind = (d) => set((c) => ({ windLevel: Math.max(0, Math.min(100, c.windLevel + d)) }));
  const spinning = readout.rpm > 0.5;
  const generating = readout.power > 0.05;
  const lit = readout.brightness > 0.01;

  const turbineState = controls.paused ? 'Pausada' : !controls.turbineOn ? 'Travada' : spinning ? 'Girando' : 'Liberada';

  return (
    <aside className="col-controls" aria-label="Painel de controle">
      {locked && <p className="locked-note">O roteiro “Como funciona?” está conduzindo o vento e a turbina.</p>}

      {/* ---------------- 01 VENTO ---------------- */}
      <section className="group">
        <GroupHead index="01" title="Vento" state={controls.windOn ? 'Soprando' : 'Desligado'} tone={controls.windOn ? 'air' : ''} />
        <div className="toggle-pair" role="group" aria-label="Vento">
          <button className="air" aria-pressed={controls.windOn} disabled={locked} onClick={() => set({ windOn: true })}>
            <Wind size={17} /> Iniciar
          </button>
          <button aria-pressed={false} disabled={locked || !controls.windOn} onClick={() => set({ windOn: false })}>
            <Square size={14} /> Parar
          </button>
        </div>
        <div className="field">
          <div className="field-label">
            <span>Intensidade</span>
            <span className="field-value">
              {lvl}
              <small>%</small> <small>· {((lvl / 100) * PHYS.VMAX).toFixed(1)} m/s</small>
            </span>
          </div>
          <div className="slider-row">
            <button className="btn square" onClick={() => changeWind(-10)} aria-label="Diminuir intensidade do vento">
              <Minus size={16} />
            </button>
            <label className="slider">
              <span className="sr-only">Intensidade do vento</span>
              <input type="range" min={0} max={100} step={1} value={lvl} onChange={(e) => set({ windLevel: Number(e.target.value) })} style={{ '--p': `${lvl}%` }} />
            </label>
            <button className="btn square" onClick={() => changeWind(10)} aria-label="Aumentar intensidade do vento">
              <Plus size={16} />
            </button>
          </div>
          <div className="scale-ticks" aria-hidden="true">
            <span>brisa</span>
            <span>moderado</span>
            <span>forte</span>
          </div>
        </div>
      </section>

      {/* ---------------- 02 TURBINA ---------------- */}
      <section className="group">
        <GroupHead index="02" title="Turbina" state={turbineState} tone={spinning && !controls.paused ? 'on' : ''} />
        <div className="readline-block">
          <div className="readline">
            <span>Rotação</span>
            <b className={`mono ${spinning ? 'on' : ''}`}>{Math.round(readout.rpm)} RPM</b>
          </div>
        </div>
        <button className={`btn ${controls.turbineOn ? 'is-active' : 'primary'}`} style={{ width: '100%' }} onClick={() => set({ turbineOn: !controls.turbineOn })} disabled={locked} aria-pressed={controls.turbineOn}>
          {controls.turbineOn ? <Lock size={16} /> : <Unlock size={16} />}
          {controls.turbineOn ? 'Travar turbina (freio)' : 'Iniciar turbina'}
        </button>
        <div className="btn-row" style={{ marginTop: 8 }}>
          <button className={`btn ${controls.paused ? 'is-active' : ''}`} onClick={() => set({ paused: !controls.paused })} aria-pressed={controls.paused}>
            {controls.paused ? <Play size={16} /> : <Pause size={16} />}
            {controls.paused ? 'Continuar' : 'Pausar'}
          </button>
          <button className="btn" onClick={reset}>
            <RotateCcw size={16} /> Reiniciar
          </button>
        </div>
        <p className="sub-label">Velocidade da simulação</p>
        <div className="speed-pick" role="radiogroup" aria-label="Velocidade da simulação">
          {SPEEDS.map((s) => (
            <button key={s} role="radio" aria-checked={controls.simSpeed === s} onClick={() => set({ simSpeed: s })}>
              {String(s).replace('.', ',')}×
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- 03 ENERGIA ---------------- */}
      <section className="group">
        <GroupHead index="03" title="Energia" state={generating ? 'Em geração' : 'Sem geração'} tone={generating ? 'on' : ''} />
        <div className="readline">
          <span>Gerador</span>
          <b className={generating ? 'on' : ''}>{generating ? 'Produzindo corrente' : 'Parado'}</b>
        </div>
        <div className="readline">
          <span>Geração</span>
          <span className="mini-bar" role="presentation">
            <i style={{ width: `${Math.min(100, readout.brightness * 100)}%` }} />
          </span>
        </div>
        <div className="readline">
          <span>Lâmpada</span>
          <b className={lit ? 'on' : ''}>
            <span className="bulb-dot" style={{ '--b': readout.brightness, width: 12, height: 12 }} />
            {lampState(readout.brightness)}
          </b>
        </div>
      </section>

      {/* ---------------- 04 VISUALIZAÇÃO ---------------- */}
      <section className="group">
        <GroupHead index="04" title="Visualização" />
        <div className="btn-row">
          <button className={`btn ${controls.xray ? 'is-active' : ''}`} onClick={() => set({ xray: !controls.xray })} aria-pressed={controls.xray}>
            <ScanEye size={16} /> Raio-X
          </button>
          <button className={`btn ${controls.showLabels ? 'is-active' : ''}`} onClick={() => set({ showLabels: !controls.showLabels })} aria-pressed={controls.showLabels}>
            <Tags size={16} /> Marcadores
          </button>
        </div>
        <button className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={onRecenter}>
          <Crosshair size={16} /> Recentrar câmera
        </button>
      </section>
    </aside>
  );
});
