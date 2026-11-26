/**
 * Turbine3D — monta a turbina completa: base, estrutura (colunas),
 * eixo vertical, rotor Savonius, transmissão e gerador.
 * Cada peça está dentro de um ExplodePart (clicável + vista explodida).
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PartMaterial, useScene } from './SceneContext';
import { ExplodePart } from './ExplodedView';
import { TurbineBlades, ROTOR } from './TurbineBlades';
import { Generator3D, Gear, SmallGear, GEN } from './Generator3D';

const TOP = 4.35; // altura da travessa superior

/** Eixo vertical que gira junto com o rotor (com faixas para ver o giro). */
function Shaft() {
  const ref = useRef();
  const ctx = useScene();
  useFrame(() => {
    ref.current.rotation.y = -ctx.sim.current.angle;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, (0.3 + TOP) / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, TOP - 0.3, 24]} />
        <PartMaterial id="eixo" color="#e5e7eb" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Marcas laterais: deixam a rotação do eixo visível */}
      {[0.75, 1.25, 3.95].map((y) => (
        <mesh key={y} position={[0.05, y, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.04]} />
          <PartMaterial id="eixo" color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Engrenagem grande presa ao eixo. */
function BigGear() {
  const ref = useRef();
  const ctx = useScene();
  useFrame(() => {
    ref.current.rotation.y = -ctx.sim.current.angle;
  });
  return (
    <group ref={ref} position={[0, GEN.gearY, 0]}>
      <Gear radius={0.42} teeth={30} id="transmissao" color="#f59e0b" />
    </group>
  );
}

/** Base, colunas, travessa e rolamentos. */
function Structure() {
  return (
    <group>
      <mesh position={[0.25, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.0, 0.3, 2.0]} />
        <PartMaterial id="base" color="#1f2a3a" metalness={0.3} roughness={0.7} shell />
      </mesh>
      <mesh position={[0.25, 0.305, 0]}>
        <boxGeometry args={[2.9, 0.01, 1.9]} />
        <PartMaterial id="base" color="#334155" metalness={0.3} roughness={0.6} shell />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, (0.3 + TOP) / 2, 0]} castShadow>
          <boxGeometry args={[0.12, TOP - 0.3, 0.12]} />
          <PartMaterial id="base" color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, TOP + 0.05, 0]} castShadow>
        <boxGeometry args={[2.42, 0.1, 0.14]} />
        <PartMaterial id="base" color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Rolamentos (superior e inferior) */}
      {[TOP - 0.03, 0.36].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.03, 12, 32]} />
          <PartMaterial id="base" color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export function Turbine3D() {
  return (
    <group>
      <ExplodePart id="base" number={7} offset={[0, -0.8, 0]} labelPos={[-1.3, 0.35, 1]}>
        <Structure />
      </ExplodePart>
      <ExplodePart id="eixo" number={2} offset={[0, 0.9, 1.0]} labelPos={[0.05, 4.05, 0.1]}>
        <Shaft />
      </ExplodePart>
      <ExplodePart id="pas" number={1} offset={[0, 2.0, 0]} labelPos={[-0.75, ROTOR.bottom + ROTOR.height * 0.7, 0.5]}>
        <TurbineBlades />
      </ExplodePart>
      <ExplodePart id="transmissao" number={3} offset={[0.5, 0.3, 0.8]} labelPos={[-0.3, GEN.gearY + 0.12, 0.45]}>
        <BigGear />
        <SmallGear />
      </ExplodePart>
      <ExplodePart id="gerador" number={4} offset={[1.0, 0, 1.0]} labelPos={[GEN.x + 0.1, 0.6, 0.45]}>
        <Generator3D />
      </ExplodePart>
    </group>
  );
}
