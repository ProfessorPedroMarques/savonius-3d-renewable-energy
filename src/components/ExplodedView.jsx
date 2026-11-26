/**
 * ExplodePart — envolve uma peça da turbina e:
 *  1. desloca a peça na "vista explodida" (offset × fator de explosão animado);
 *  2. torna a peça clicável (abre a explicação) e destaca ao passar o mouse;
 *  3. mostra um marcador 3D (etiqueta) que acompanha a peça.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useScene } from './SceneContext';
import { PARTS } from '../data/content';

export function ExplodePart({ id, offset = [0, 0, 0], labelPos, number, children }) {
  const g = useRef();
  const ctx = useScene();

  useFrame(() => {
    const e = ctx.sim.current.explode;
    g.current.position.set(offset[0] * e, offset[1] * e, offset[2] * e);
  });

  const active = ctx.highlight.includes(id) || ctx.selected === id;

  return (
    <group
      ref={g}
      onClick={(e) => {
        e.stopPropagation();
        ctx.select(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        ctx.hoverRef.current = id;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (ctx.hoverRef.current === id) ctx.hoverRef.current = null;
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
      {ctx.showLabels && labelPos && (
        <Html position={labelPos} center zIndexRange={[20, 0]}>
          <button
            type="button"
            className={`marker ${active ? 'is-active' : ''} ${ctx.dim && !active ? 'is-dim' : ''}`}
            onClick={() => ctx.select(id)}
            aria-label={`Explicação: ${PARTS[id].titulo}`}
          >
            <span className="marker-num">{number}</span>
            <span className="marker-txt">{PARTS[id].titulo}</span>
          </button>
        </Html>
      )}
    </group>
  );
}
