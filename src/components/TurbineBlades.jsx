/**
 * TurbineBlades — rotor Savonius de 2 pás.
 * Cada pá é um MEIO-CILINDRO com espessura (anel semicircular extrudado),
 * deslocado do eixo para criar a sobreposição clássica em "S".
 * Discos de fixação (placas superior/inferior) prendem as pás ao eixo.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PartMaterial, useScene } from './SceneContext';

export const ROTOR = { bottom: 1.4, height: 2.4, r: 0.42, offset: 0.3, thick: 0.035 };

/** Geometria de meio anel (semicírculo com espessura) extrudado na vertical. */
function useBladeGeometry() {
  return useMemo(() => {
    const { r, thick, height } = ROTOR;
    const ro = r + thick / 2;
    const ri = r - thick / 2;
    const s = new THREE.Shape();
    s.absarc(0, 0, ro, 0, Math.PI, false); // arco externo
    s.lineTo(-ri, 0);
    s.absarc(0, 0, ri, Math.PI, 0, true); // arco interno (volta)
    s.lineTo(ro, 0);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 48,
    });
    geo.rotateX(-Math.PI / 2); // extrusão passa a ser no eixo Y (vertical)
    return geo;
  }, []);
}

export function TurbineBlades() {
  const ref = useRef();
  const ctx = useScene();
  const geo = useBladeGeometry();
  const { bottom, height, offset } = ROTOR;

  // O rotor gira em torno do eixo vertical conforme o ângulo da simulação
  useFrame(() => {
    ref.current.rotation.y = -ctx.sim.current.angle;
  });

  return (
    <group ref={ref}>
      {[0, Math.PI].map((rot, i) => (
        <group key={rot} rotation={[0, rot, 0]}>
          <mesh geometry={geo} position={[offset, bottom, 0]} castShadow>
            <PartMaterial id="pas" color={i ? "#c9d8e8" : "#f4f1ea"} metalness={0.2} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
          {/* Faixa de reforço no meio da pá */}
          <mesh position={[offset, bottom + height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ROTOR.r + 0.02, 0.012, 8, 40, Math.PI]} />
            <PartMaterial id="pas" color="#efb039" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Discos de fixação (acrílico) */}
      {[bottom - 0.03, bottom + height + 0.03].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[0.86, 0.86, 0.04, 64]} />
          <PartMaterial id="pas" color="#a9c3dd" metalness={0.1} roughness={0.15} opacity={0.55} />
        </mesh>
      ))}
      {/* Cubos de fixação no eixo */}
      {[bottom - 0.08, bottom + height + 0.08].map((y) => (
        <mesh key={'hub' + y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.1, 24]} />
          <PartMaterial id="eixo" color="#8e86a0" metalness={0.8} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}
