/**
 * Indicators — telemetria da simulação (coluna direita).
 *  - Mostrador de RPM com um pequeno rotor que gira no ÂNGULO REAL da simulação;
 *  - barra de vento com fluxo animado (só quando há vento);
 *  - medidor segmentado de energia;
 *  - estados do gerador e da lâmpada.
 * IMPORTANTE: valores conceituais, não são medições reais.
 */
import { memo, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { P_MAX, PHYS } from '../hooks/useTurbineSimulation';

export const RPM_MAX = (((PHYS.LAMBDA * PHYS.VMAX) / PHYS.R) * 60) / (2 * Math.PI);
const SEGMENTS = 12;

export function lampState(b) {
  if (b <= 0.01) return 'Apagada';
  if (b < 0.3) return 'Fraca';
  if (b < 0.85) return 'Acesa';
  return 'Brilho máximo';
}

/** Rotor Savonius em miniatura que gira junto com o rotor 3D. */
function MiniRotor({ sim }) {
  const g = useRef();
  useEffect(() => {
    let raf;
    const loop = () => {
      if (g.current) g.current.setAttribute('transform', `rotate(${(-sim.current.angle * 180) / Math.PI} 20 20)`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sim]);
  return (
    <svg className="dial-rotor" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <g ref={g} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M20 20 A7 7 0 0 1 20 6" />
        <path d="M20 20 A7 7 0 0 1 20 34" />
        <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

function RpmDial({ rpm, sim }) {
  const frac = Math.min(1, rpm / RPM_MAX);
  const ticks = Array.from({ length: 7 }, (_, i) => {
    const a = ((150 + (i * 240) / 6) * Math.PI) / 180;
    return [100 + 68 * Math.cos(a), 100 + 68 * Math.sin(a), 100 + 60 * Math.cos(a), 100 + 60 * Math.sin(a)];
  });
  return (
    <div className="dial-wrap">
      <svg className="dial" viewBox="0 0 200 160" role="img" aria-label={`Rotação do rotor: ${Math.round(rpm)} RPM`}>
        <path className="arc-bg" d="M30.7 140 A80 80 0 1 1 169.3 140" pathLength="100" />
        <path className="arc" d="M30.7 140 A80 80 0 1 1 169.3 140" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - frac)} />
        {ticks.map(([x1, y1, x2, y2], i) => (
          <line key={i} className="tick" x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </svg>
      <div className="dial-center">
        <MiniRotor sim={sim} />
        <div className="dial-value">{Math.round(rpm)}</div>
        <div className="dial-unit">RPM DO ROTOR</div>
      </div>
    </div>
  );
}

export const Indicators = memo(function Indicators({ readout, sim }) {
  const { wind, rpm, power, brightness, voltage } = readout;
  const generating = power > 0.05;
  const lit = brightness > 0.01;
  const energyFrac = Math.min(1, power / P_MAX);
  const onSegments = Math.round(energyFrac * SEGMENTS + (generating ? 0.5 : 0));

  return (
    <section className="group" aria-label="Telemetria" aria-live="off">
      <div className="group-head">
        <span className="group-index">◆</span>
        <h2>Telemetria</h2>
        <span className={`state ${generating ? 'on' : ''}`}>{generating ? 'Ao vivo' : 'Em repouso'}</span>
      </div>

      <RpmDial rpm={rpm} sim={sim} />
      <div className="dial-foot">
        <span>
          Gerador <b>{Math.round(rpm * PHYS.GEAR)}</b> RPM
        </span>
        <span>
          relação <b>1:{PHYS.GEAR}</b>
        </span>
      </div>

      <div className="metric" style={{ marginTop: 18 }}>
        <div className="metric-head">
          <span>Velocidade do vento</span>
          <b>
            {wind.toFixed(1)}
            <small>m/s</small>
          </b>
        </div>
        <div className="wind-track" role="meter" aria-label="Velocidade do vento" aria-valuemin={0} aria-valuemax={PHYS.VMAX} aria-valuenow={Number(wind.toFixed(1))}>
          <i style={{ width: `${(wind / PHYS.VMAX) * 100}%` }} />
        </div>
      </div>

      <div className="metric" style={{ marginTop: 18 }}>
        <div className="metric-head">
          <span>Energia simulada</span>
          <b>
            {power.toFixed(1)}
            <small>W</small>
          </b>
        </div>
        <div className="segments" role="meter" aria-label="Energia simulada" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(energyFrac * 100)}>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <i key={i} className={i < onSegments ? 'on' : ''} />
          ))}
        </div>
      </div>

      <div className="energy-states">
        <div className={`estate ${generating ? 'on' : ''}`}>
          <span className="estate-label">Gerador</span>
          <span className="estate-value">
            <svg className="coil-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 12h3c0-3 2-3 2 0s2 3 2 0 2-3 2 0 2 3 2 0 2-3 2 0h3" />
            </svg>
            {generating ? 'Gerando' : 'Parado'}
          </span>
          <span className="estate-sub">{voltage.toFixed(1)} V</span>
        </div>
        <div className={`estate ${lit ? 'on' : ''}`}>
          <span className="estate-label">Lâmpada</span>
          <span className="estate-value">
            <span className="bulb-dot" style={{ '--b': brightness }} />
            {lampState(brightness)}
          </span>
          <span className="estate-sub">brilho {Math.round(brightness * 100)}%</span>
        </div>
      </div>

      <p className="disclaimer">
        <Info size={15} />
        Representação conceitual a partir de um modelo simplificado (P ≈ Cp·½·ρ·A·v³). Não é uma medição real.
      </p>
    </section>
  );
});
