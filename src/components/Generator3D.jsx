/**
 * Generator3D — gerador elétrico na base + transmissão por engrenagens.
 * - Carcaça (fica translúcida no Raio-X) com aletas de resfriamento.
 * - Por dentro: rotor com ímãs (vermelho = norte, azul = sul) girando
 *   3× mais rápido que as pás, e bobinas de cobre fixas (estator) que
 *   brilham conforme a energia gerada.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PartMaterial, useScene } from './SceneContext';
import { PHYS } from '../hooks/useTurbineSimulation';

export const GEN = { x: 0.6, y: 0.3, h: 0.66, r: 0.3, gearY: 1.05 };

/** Engrenagem simples: disco + dentes. */
export function Gear({ radius, teeth, id, color }) {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, 0.08, 48]} />
        <PartMaterial id={id} color={color} metalness={0.85} roughness={0.3} />
      </mesh>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (radius + 0.025), 0, Math.sin(a) * (radius + 0.025)]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.05, 0.08, 0.035]} />
            <PartMaterial id={id} color={color} metalness={0.85} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Engrenagem pequena + eixo do gerador (gira com a transmissão). */
export function SmallGear() {
  const ref = useRef();
  const ctx = useScene();
  useFrame(() => {
    // Sentido oposto e 3× mais rápido (relação 1:3)
    ref.current.rotation.y = ctx.sim.current.angle * PHYS.GEAR + 0.3;
  });
  return (
    <group ref={ref} position={[GEN.x, GEN.gearY, 0]}>
      <Gear radius={0.13} teeth={10} id="transmissao" color="#fbbf24" />
    </group>
  );
}

export function Generator3D() {
  const rotor = useRef();
  const coilMat = useRef([]);
  const ctx = useScene();

  useFrame(() => {
    const s = ctx.sim.current;
    rotor.current.rotation.y = s.angle * PHYS.GEAR;
  });

  const cy = GEN.y + GEN.h / 2;

  return (
    <group position={[GEN.x, 0, 0]}>
      {/* Carcaça externa */}
      <mesh position={[0, cy, 0]} castShadow>
        <cylinderGeometry args={[GEN.r, GEN.r, GEN.h, 48, 1, true]} />
        <PartMaterial id="gerador" color="#1e3a5f" metalness={0.7} roughness={0.35} shell side={2} />
      </mesh>
      {/* Aletas de resfriamento */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, GEN.y + 0.1 + i * 0.12, 0]}>
          <torusGeometry args={[GEN.r + 0.01, 0.014, 8, 48]} />
          <PartMaterial id="gerador" color="#38bdf8" metalness={0.8} roughness={0.3} shell />
        </mesh>
      ))}
      {/* Tampa superior */}
      <mesh position={[0, GEN.y + GEN.h, 0]}>
        <cylinderGeometry args={[GEN.r + 0.02, GEN.r + 0.02, 0.05, 48]} />
        <PartMaterial id="gerador" color="#0f2742" metalness={0.7} roughness={0.4} shell />
      </mesh>
      {/* Eixo do gerador até a engrenagem pequena */}
      <mesh position={[0, GEN.y + GEN.h + 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
        <PartMaterial id="transmissao" color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* --- Interior: rotor com ímãs --- */}
      <group ref={rotor} position={[0, cy, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, GEN.h - 0.08, 16]} />
          <PartMaterial id="gerador" color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.1, GEN.h - 0.2, 0.09]} />
              <PartMaterial id="gerador" color={i % 2 ? '#3b82f6' : '#ef4444'} metalness={0.3} roughness={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* --- Interior: bobinas de cobre (estator) --- */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.235, cy, Math.sin(a) * 0.235]} rotation={[0, -a + Math.PI / 2, 0]}>
            <torusGeometry args={[0.07, 0.022, 10, 24]} />
            <CoilMaterial index={i} store={coilMat} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Material das bobinas: cobre que brilha com a energia gerada. */
function CoilMaterial() {
  const ref = useRef();
  const ctx = useScene();
  useFrame(() => {
    const b = ctx.sim.current.brightness;
    const hl = ctx.highlight.includes('gerador') || ctx.hoverRef.current === 'gerador';
    ref.current.emissiveIntensity = b * 1.6 + (hl ? 0.4 : 0);
  });
  return <meshStandardMaterial ref={ref} color="#c2702f" emissive="#ffb347" metalness={0.9} roughness={0.3} />;
}
