/**
 * EnergyFlow — cabos elétricos (gerador → lâmpada) e partículas luminosas
 * que percorrem os cabos. A velocidade das partículas acompanha a rotação
 * e o brilho acompanha a energia gerada. Rotor parado = sem fluxo.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PartMaterial, useScene } from './SceneContext';
import { GEN } from './Generator3D';
import { LAMP } from './LightBulb';

const PER_CABLE = 22;

/** Caminho de um cabo; dz separa o fio de ida do de volta. */
function makeCurve(dz) {
  const lx = LAMP.x;
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(GEN.x + GEN.r - 0.02, 0.55, dz),
    new THREE.Vector3(GEN.x + GEN.r + 0.25, 0.45, dz + 0.1),
    new THREE.Vector3(1.75, 0.33, 0.45 + dz),
    new THREE.Vector3(lx - 0.3, 0.12, 0.45 + dz),
    new THREE.Vector3(lx - 0.06, 0.2, LAMP.z + dz * 0.5),
    new THREE.Vector3(lx - 0.06, LAMP.poleTop - 0.05, LAMP.z + dz * 0.3),
  ]);
}

function Cable({ curve, color, reverse }) {
  const inst = useRef();
  const mat = useRef();
  const ctx = useScene();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pt = useMemo(() => new THREE.Vector3(), []);
  const phase = useRef(0);

  useFrame((_, delta) => {
    const s = ctx.sim.current;
    const c = ctx.controls;
    const dt = Math.min(delta, 0.05) * (c.paused ? 0 : c.simSpeed);
    const b = s.brightness;
    inst.current.visible = s.omega > 0.05;
    if (!inst.current.visible) return;
    // A "corrente" avança proporcional à rotação
    phase.current = (phase.current + s.omega * dt * 0.045) % 1;
    const hl = ctx.highlight.includes('cabos');
    mat.current.opacity = Math.min(1, 0.25 + b * 1.2);
    for (let i = 0; i < PER_CABLE; i++) {
      let u = (i / PER_CABLE + phase.current) % 1;
      if (reverse) u = 1 - u; // fio de volta: fluxo no sentido contrário
      curve.getPointAt(u, pt);
      dummy.position.copy(pt);
      dummy.scale.setScalar((0.45 + b * 0.4) * (hl ? 1.25 : 1));
      dummy.updateMatrix();
      inst.current.setMatrixAt(i, dummy.matrix);
    }
    inst.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 80, 0.022, 10, false]} />
        <PartMaterial id="cabos" color={color} metalness={0.2} roughness={0.6} />
      </mesh>
      <instancedMesh ref={inst} args={[null, null, PER_CABLE]} frustumCulled={false}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshBasicMaterial ref={mat} color="#ffd27a" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </group>
  );
}

export function EnergyFlow() {
  const curves = useMemo(() => [makeCurve(0.06), makeCurve(-0.06)], []);
  return (
    <group>
      <Cable curve={curves[0]} color="#c2453a" />
      <Cable curve={curves[1]} color="#231a30" reverse />
    </group>
  );
}
