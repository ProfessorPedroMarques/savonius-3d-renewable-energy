/**
 * WindParticles — "riscos" de vento (InstancedMesh) que viajam da esquerda
 * até o rotor. Velocidade e opacidade acompanham a intensidade do vento.
 * Perto do rotor as partículas desviam (contornam as pás) e ficam mais lentas.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from './SceneContext';
import { ROTOR } from './TurbineBlades';

const COUNT = 320;
const X0 = -7;
const X1 = 3.5;

export function WindParticles() {
  const mesh = useRef();
  const mat = useRef();
  const ctx = useScene();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Posição inicial aleatória de cada partícula
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: X0 + Math.random() * (X1 - X0),
        y: ROTOR.bottom - 0.3 + Math.random() * (ROTOR.height + 0.6),
        z: -1.8 + Math.random() * 3.6,
        s: 0.7 + Math.random() * 0.6, // variação individual de velocidade
      })),
    []
  );

  useFrame((_, delta) => {
    const s = ctx.sim.current;
    const c = ctx.controls;
    const dt = Math.min(delta, 0.05) * (c.paused ? 0 : c.simSpeed);
    const w = s.wind;
    const visible = w > 0.05;
    mesh.current.visible = visible;
    if (!visible) return;

    const hl = ctx.highlight.includes('vento');
    mat.current.opacity = Math.min(0.85, w / 5) * (hl ? 1 : 0.75);
    mat.current.color.set(hl ? '#f4f1ea' : '#a9c3dd');

    for (let i = 0; i < COUNT; i++) {
      const p = data[i];
      const r = Math.hypot(p.x, p.z);
      // Fica mais lento e é empurrado para os lados ao passar pelo rotor
      const near = r < 1.0 && p.y > ROTOR.bottom && p.y < ROTOR.bottom + ROTOR.height;
      const speed = w * 0.55 * p.s * (near ? 0.45 : 1);
      p.x += speed * dt;
      if (near) p.z += Math.sign(p.z || 1) * speed * dt * 0.6;
      if (p.x > X1) {
        p.x = X0;
        p.z = -1.8 + Math.random() * 3.6;
      }
      // Some suavemente nas pontas
      const fade = Math.min(1, (p.x - X0) / 1.2, (X1 - p.x) / 1.2);
      const len = 0.15 + w * 0.05;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(len * fade, fade, fade);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 0.018, 0.018]} />
      <meshBasicMaterial ref={mat} color="#a9c3dd" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}
