/**
 * MainScene — o <Canvas> 3D: luzes, chão, câmera com OrbitControls e
 * todos os componentes da turbina. Também roda o "motor" da simulação
 * (SimDriver), que avança a física a cada quadro.
 *
 * Envolvido em memo(): as leituras da interface (10×/s) não re-renderizam a cena.
 */
import { memo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Grid, Html } from '@react-three/drei';
import { SceneCtx, BRAND } from '../components/SceneContext';
import { Turbine3D } from '../components/Turbine3D';
import { WindParticles } from '../components/WindParticles';
import { EnergyFlow } from '../components/EnergyFlow';
import { LightBulb, LAMP } from '../components/LightBulb';
import { ExplodePart } from '../components/ExplodedView';

/** Chama step() da simulação a cada quadro renderizado. */
function SimDriver({ step, explodeTarget }) {
  useFrame((_, delta) => step(delta, explodeTarget));
  return null;
}

/** Indica de onde vem o vento. */
function WindLabel({ show }) {
  if (!show) return null;
  return (
    <Html position={[-4.6, 0.9, 0]} center zIndexRange={[4, 0]}>
      <div className="wind-tag">VENTO →</div>
    </Html>
  );
}

export const MainScene = memo(function MainScene({ sim, step, controls, highlight, selected, select, dim, explodeTarget, orbitRef }) {
  const hoverRef = useRef(null);
  const ctx = { sim, controls, highlight, selected, select, dim, hoverRef, xray: controls.xray, showLabels: controls.showLabels };

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [5.6, 3.9, 7.4], fov: 42 }}
      onPointerMissed={(e) => {
        // Cliques nos marcadores HTML também chegam ao canvas: ignorar
        if (e.target?.closest?.('.marker')) return;
        select(null);
      }}
      aria-label="Cena 3D da turbina Savonius"
    >
      <color attach="background" args={[BRAND.bg]} />
      <fog attach="fog" args={[BRAND.bg, 13, 28]} />
      <SceneCtx.Provider value={ctx}>
        <SimDriver step={step} explodeTarget={explodeTarget} />

        {/* Iluminação: luz principal quente, preenchimento roxo, contraluz azul */}
        <ambientLight intensity={0.3} color="#e9e0f5" />
        <hemisphereLight args={['#d8cdea', '#1a1026', 0.45]} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.5}
          color="#fff3de"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-6, 4, -5]} intensity={0.7} color={BRAND.blue} />
        <pointLight position={[-3, 1.2, 3]} intensity={3} distance={9} color={BRAND.purple} />

        <Turbine3D />
        <ExplodePart id="cabos" number={5} offset={[1.0, 0, 0.8]} labelPos={[1.75, 0.55, 0.55]}>
          <EnergyFlow />
        </ExplodePart>
        <ExplodePart id="lampada" number={6} offset={[1.4, 0, 0]} labelPos={[LAMP.x, LAMP.poleTop + 0.95, LAMP.z]}>
          <LightBulb />
        </ExplodePart>
        <WindParticles />
        <WindLabel show={controls.showLabels && controls.windOn} />

        {/* Chão: grade técnica nos tons da marca */}
        <Grid
          position={[0, 0, 0]}
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#2a1f3d"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#4e3770"
          fadeDistance={22}
          fadeStrength={1.5}
          infiniteGrid
        />
        <ContactShadows position={[0, 0.001, 0]} opacity={0.6} scale={14} blur={2.4} far={5} color="#07030c" />

        <OrbitControls ref={orbitRef} makeDefault target={[0.4, 1.9, 0]} minDistance={3} maxDistance={18} maxPolarAngle={Math.PI / 2 - 0.05} enableDamping />
      </SceneCtx.Provider>
    </Canvas>
  );
});
