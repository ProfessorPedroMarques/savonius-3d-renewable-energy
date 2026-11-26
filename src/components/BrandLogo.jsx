/**
 * BrandLogo — logo oficial da PEI Ary Gomes com animação AO REDOR dela.
 * A imagem original nunca é redesenhada, recortada ou distorcida
 * (object-fit: contain, proporção 240 × 184).
 *
 * Camadas:
 *  - contorno luminoso (SVG) que percorre a borda da placa da logo;
 *  - partículas em órbita, cuja rotação acompanha o ÂNGULO REAL do rotor;
 *  - brilho da placa proporcional à energia gerada (--energy, definido no App);
 *  - "pulso" curto quando o rotor começa a girar.
 */
import { useEffect, useRef } from 'react';

export const LOGO_SRC = '/logo-ary-gomes.jpg';
const SIZES = {
  small: { w: 86, h: 69, r: 8 },
  large: { w: 260, h: 209, r: 14 },
};

export function BrandLogo({ size = 'small', sim }) {
  const root = useRef();
  const orbit = useRef();
  const { w, h, r } = SIZES[size];

  // Liga a órbita e o pulso ao estado real da simulação (sem re-render do React)
  useEffect(() => {
    if (!sim) return;
    let raf;
    let wasSpinning = false;
    let idle = 0;
    const loop = () => {
      const s = sim.current;
      idle += 0.0015; // deriva lenta mesmo parada
      if (orbit.current) orbit.current.style.transform = `rotate(${(s.angle * 0.35 + idle) * 57.3}deg)`;
      const spinning = s.omega > 0.4;
      if (spinning && !wasSpinning && root.current) {
        root.current.classList.remove('is-kick');
        void root.current.offsetWidth; // reinicia a animação
        root.current.classList.add('is-kick');
      }
      wasSpinning = spinning;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sim]);

  return (
    <div ref={root} className={`brand-logo ${size === 'large' ? 'is-large' : ''}`}>
      <svg className="brand-ring" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        <rect className="track" x="2" y="2" width={w - 4} height={h - 4} rx={r} pathLength="100" />
        <rect className="trace" x="2" y="2" width={w - 4} height={h - 4} rx={r} pathLength="100" />
        <rect className="trace alt" x="2" y="2" width={w - 4} height={h - 4} rx={r} pathLength="100" />
      </svg>
      {sim && (
        <div ref={orbit} className="brand-orbit" aria-hidden="true">
          {[0, 120, 240].map((a) => (
            <i key={a} style={{ transform: `rotate(${a}deg) translate(${w / 2 + 3}px) scale(${a ? 0.7 : 1})` }} />
          ))}
        </div>
      )}
      <div className="brand-plate">
        <img src={LOGO_SRC} alt="Logo da PEI Ary Gomes" width="240" height="184" />
      </div>
    </div>
  );
}
