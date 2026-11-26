/**
 * useTurbineSimulation
 * ------------------------------------------------------------------
 * Concentra TODO o estado da simulação.
 *
 * - Estado React (useState): o que a interface exibe/controla
 *   (vento ligado, intensidade, turbina liberada, pausa, modos...).
 * - Estado "físico" (useRef): valores que mudam a cada quadro (60x/s),
 *   como velocidade angular e ângulo do rotor. Ficam em ref para não
 *   re-renderizar o React a cada quadro; os componentes 3D leem o ref
 *   dentro de useFrame.
 *
 * MODELO MATEMÁTICO SIMPLIFICADO (representação conceitual!):
 *   v       = velocidade do vento (m/s) = nível(0–100%) × 12 m/s
 *   ω_alvo  = λ · v / R          (λ ≈ 0,8 é típico de rotores Savonius)
 *   dω/dt   = (ω_alvo − ω) / τ   (inércia: acelera/desacelera suave)
 *   P_elét  ≈ Cp · η · ½ · ρ · A · v_ef³ , com v_ef = ω·R/λ
 *   Cp ≈ 0,18 (Savonius aproveita ~15–20%), η ≈ 0,7 (gerador)
 * Os números são ilustrativos — NÃO são medições reais.
 */
import { useCallback, useRef, useState } from 'react';

export const PHYS = {
  VMAX: 12, // m/s quando o controle está em 100%
  R: 0.5, // raio do rotor (m)
  H: 1.0, // altura do rotor (m) — usada só no cálculo da área
  LAMBDA: 0.8, // razão de velocidade de ponta
  TAU: 1.6, // constante de tempo da inércia (s)
  RHO: 1.2, // densidade do ar (kg/m³)
  CP: 0.18, // coeficiente de potência
  ETA: 0.7, // eficiência do gerador
  GEAR: 3, // relação de transmissão (engrenagem grande → pequena)
  LAMP_W: 12, // potência para a lâmpada brilhar 100% (W)
};

const AREA = 2 * PHYS.R * PHYS.H;
const OMEGA_MAX = (PHYS.LAMBDA * PHYS.VMAX) / PHYS.R;
export const P_MAX = PHYS.CP * PHYS.ETA * 0.5 * PHYS.RHO * AREA * PHYS.VMAX ** 3;

const INITIAL = {
  windOn: false,
  windLevel: 50,
  turbineOn: false,
  paused: false,
  simSpeed: 1,
  xray: false,
  showLabels: true,
};

export function useTurbineSimulation() {
  const [controls, setControls] = useState(INITIAL);
  const [readout, setReadout] = useState({ wind: 0, rpm: 0, power: 0, brightness: 0, voltage: 0 });

  // Estado físico atualizado a cada quadro
  const sim = useRef({ omega: 0, angle: 0, wind: 0, power: 0, brightness: 0, explode: 0, time: 0 });
  const controlsRef = useRef(controls);
  controlsRef.current = controls;
  const lastUi = useRef(0);

  /** Atualiza parte dos controles: set({ windOn: true }) ou set(c => ({...})) */
  const set = useCallback(
    (patch) => setControls((c) => ({ ...c, ...(typeof patch === 'function' ? patch(c) : patch) })),
    []
  );

  /** Avança a física em dt segundos (chamado dentro de useFrame). */
  const step = useCallback((rawDt, explodeTarget) => {
    const c = controlsRef.current;
    const s = sim.current;
    const frame = Math.min(rawDt, 0.1);
    const dt = frame * (c.paused ? 0 : c.simSpeed);

    // A vista explodida anima mesmo pausada (é só visualização)
    s.explode += (explodeTarget - s.explode) * Math.min(1, frame * 3);

    // O vento "sobe" e "desce" suavemente até o valor escolhido
    const windTarget = c.windOn ? (c.windLevel / 100) * PHYS.VMAX : 0;
    s.wind += (windTarget - s.wind) * Math.min(1, dt * 1.5);
    if (!c.windOn && s.wind < 0.02) s.wind = 0;

    // Rotor: com a turbina travada, o freio leva a rotação a zero
    const omegaTarget = c.turbineOn ? (PHYS.LAMBDA * s.wind) / PHYS.R : 0;
    const tau = c.turbineOn ? PHYS.TAU : PHYS.TAU * 0.6;
    s.omega += ((omegaTarget - s.omega) * dt) / tau;
    if (s.omega < 0.02 && omegaTarget === 0) s.omega = 0;
    s.angle += s.omega * dt;
    s.time += dt;

    // Energia elétrica conceitual
    const vEf = (s.omega * PHYS.R) / PHYS.LAMBDA;
    s.power = PHYS.CP * PHYS.ETA * 0.5 * PHYS.RHO * AREA * vEf ** 3;
    s.brightness = Math.min(1, s.power / PHYS.LAMP_W);

    // Atualiza a interface ~10 vezes por segundo
    lastUi.current += frame;
    if (lastUi.current > 0.1) {
      lastUi.current = 0;
      setReadout({
        wind: s.wind,
        rpm: (s.omega * 60) / (2 * Math.PI),
        power: s.power,
        brightness: s.brightness,
        voltage: (s.omega / OMEGA_MAX) * 12,
      });
    }
  }, []);

  /** Volta tudo ao estado inicial (mantém preferências de visualização). */
  const reset = useCallback(() => {
    Object.assign(sim.current, { omega: 0, angle: 0, wind: 0, power: 0, brightness: 0 });
    setControls((c) => ({ ...INITIAL, xray: c.xray, showLabels: c.showLabels }));
  }, []);

  return { controls, set, readout, sim, step, reset };
}
