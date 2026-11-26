/**
 * Contexto compartilhado pelos componentes 3D (fica DENTRO do <Canvas>).
 * Também define o PartMaterial: material padrão das peças, que
 *  - brilha em laranja institucional quando a peça está destacada ou sob o mouse;
 *  - escurece discretamente quando OUTRA peça está selecionada (modo Explorar);
 *  - fica translúcido no Raio-X quando a peça é uma "casca".
 */
import { createContext, useContext, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SceneCtx = createContext(null);
export const useScene = () => useContext(SceneCtx);

/** Paleta 3D (mesmas cores institucionais do CSS) */
export const BRAND = {
  orange: '#efb039',
  orangeDeep: '#c98a1c',
  purple: '#4e3770',
  purpleDeep: '#3c2451',
  blue: '#7292b5',
  blueLight: '#a9c3dd',
  paper: '#f4f1ea',
  bg: '#140e20',
};

const HL = new THREE.Color(BRAND.orange);
const BLACK = new THREE.Color('#000000');
const DIM = 0.28; // quanto as peças não selecionadas escurecem

export function PartMaterial({
  id,
  color = '#cbd5e1',
  metalness = 0.4,
  roughness = 0.45,
  shell = false,
  opacity = 1,
  emissive,
  emissiveIntensity = 0,
  side,
}) {
  const ref = useRef();
  const ctx = useScene();
  const baseColor = useMemo(() => new THREE.Color(color), [color]);
  const baseEmissive = useMemo(() => new THREE.Color(emissive || '#000000'), [emissive]);
  const dimLevel = useRef(1);
  const xr = ctx.xray && shell;

  useFrame(({ clock }, delta) => {
    const m = ref.current;
    if (!m) return;
    const hl = ctx.highlight.includes(id) || ctx.hoverRef.current === id;

    // Escurecimento suave das outras peças
    const target = ctx.dim && !hl ? DIM : 1;
    dimLevel.current += (target - dimLevel.current) * Math.min(1, delta * 6);
    m.color.copy(baseColor).multiplyScalar(dimLevel.current);

    if (hl) {
      m.emissive.copy(HL);
      m.emissiveIntensity = 0.28 + 0.2 * Math.sin(clock.elapsedTime * 3.5);
    } else {
      m.emissive.copy(emissive ? baseEmissive : BLACK);
      m.emissiveIntensity = emissiveIntensity * dimLevel.current;
    }
  });

  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      metalness={metalness}
      roughness={roughness}
      transparent={shell || opacity < 1}
      opacity={xr ? 0.14 : opacity}
      depthWrite={!xr}
      side={side}
    />
  );
}
