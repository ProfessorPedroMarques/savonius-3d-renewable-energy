/**
 * LightBulb — lâmpada 3D sobre um pedestal.
 * O vidro e o filamento usam material emissivo e uma PointLight real
 * ilumina a cena. Brilho = sim.brightness (0 com o rotor parado).
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PartMaterial, useScene } from './SceneContext';

export const LAMP = { x: 2.45, z: 0.1, poleTop: 1.25 };
const WARM = new THREE.Color('#ffd27a');
const OFF = new THREE.Color('#9aa8b8');

export function LightBulb() {
  const glass = useRef();
  const fil = useRef();
  const halo = useRef();
  const haloGroup = useRef();
  const light = useRef();
  const ctx = useScene();

  useFrame(({ clock }) => {
    const b = ctx.sim.current.brightness;
    // Pequena cintilação quando o brilho é baixo (corrente instável)
    const flicker = b > 0 && b < 0.3 ? 0.85 + 0.15 * Math.sin(clock.elapsedTime * 25) : 1;
    const k = b * flicker;
    glass.current.emissiveIntensity = k * 2.2;
    glass.current.color.copy(OFF).lerp(WARM, Math.min(1, k * 1.5));
    glass.current.opacity = 0.35 + k * 0.5;
    fil.current.emissiveIntensity = 0.05 + k * 6;
    halo.current.opacity = k * 0.16;
    haloGroup.current.scale.setScalar(1 + k * 0.5);
    light.current.intensity = k * 14;
  });

  const y = LAMP.poleTop;
  return (
    <group position={[LAMP.x, 0, LAMP.z]}>
      {/* Pedestal */}
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 40]} />
        <PartMaterial id="lampada" color="#2a1f3d" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, y / 2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, y, 16]} />
        <PartMaterial id="lampada" color="#5a5070" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Bocal com rosca */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, y + 0.04 + i * 0.045, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.035, 24]} />
          <PartMaterial id="lampada" color="#b8c2cc" metalness={0.95} roughness={0.2} />
        </mesh>
      ))}
      {/* Vidro */}
      <mesh position={[0, y + 0.42, 0]}>
        <sphereGeometry args={[0.26, 40, 32]} />
        <meshStandardMaterial ref={glass} color="#9aa8b8" emissive="#ffc96b" emissiveIntensity={0} transparent opacity={0.35} roughness={0.1} metalness={0} depthWrite={false} />
      </mesh>
      {/* Filamento */}
      <mesh position={[0, y + 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.008, 8, 24, Math.PI]} />
        <meshStandardMaterial ref={fil} color="#333" emissive="#ffb347" emissiveIntensity={0.05} />
      </mesh>
      {/* Halo de luz */}
      <group ref={haloGroup} position={[0, y + 0.42, 0]}>
        <mesh>
          <sphereGeometry args={[0.4, 24, 16]} />
          <meshBasicMaterial ref={halo} color="#ffcf70" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, y + 0.42, 0]} color="#ffcf80" intensity={0} distance={7} decay={1.6} />
    </group>
  );
}
