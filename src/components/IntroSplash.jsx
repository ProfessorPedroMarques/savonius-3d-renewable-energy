/**
 * IntroSplash — abertura curta (~3 s):
 *  1. fundo aparece; 2. logo é revelada; 3. contorno luminoso desenha a borda;
 *  4. partículas discretas se espalham; 5. nome da escola surge;
 *  6. a abertura some e a interface principal entra.
 * Pode ser pulada (botão, clique ou tecla). Com "movimento reduzido" ativo,
 * dura uma fração de segundo.
 */
import { useEffect, useMemo } from 'react';
import { BrandLogo } from './BrandLogo';

const DURATION = 3300;

export function IntroSplash({ onDone }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(onDone, reduced ? 200 : DURATION);
    const skip = (e) => {
      if (e.type === 'keydown' && !['Escape', 'Enter', ' '].includes(e.key)) return;
      onDone();
    };
    window.addEventListener('keydown', skip);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', skip);
    };
  }, [onDone]);

  // Partículas: partem do centro em direções aleatórias
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
        const d = 160 + Math.random() * 180;
        return {
          left: `calc(50% + ${Math.cos(a) * 120}px)`,
          top: `calc(44% + ${Math.sin(a) * 90}px)`,
          '--dx': `${Math.cos(a) * d}px`,
          '--dy': `${Math.sin(a) * d}px`,
          '--d': `${0.9 + Math.random() * 0.8}s`,
          background: i % 3 === 0 ? 'var(--institution-accent-light)' : undefined,
        };
      }),
    []
  );

  return (
    <div className="intro" role="presentation" onClick={onDone}>
      <div className="intro-motes" aria-hidden="true">
        {motes.map((s, i) => (
          <i key={i} style={s} />
        ))}
      </div>
      <div className="intro-inner">
        <BrandLogo size="large" />
        <div className="intro-name">
          <strong>PEI Ary Gomes</strong>
          <span>Turbina Eólica Savonius · Simulação educacional</span>
        </div>
      </div>
      <button className="intro-skip" onClick={onDone}>
        Pular abertura
      </button>
    </div>
  );
}
