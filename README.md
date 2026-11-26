# Turbina Savonius — Simulação Educacional 3D

Simulação interativa (React + Vite + Three.js + React Three Fiber + Drei) de uma turbina eólica Savonius: do vento à luz.

## Como rodar
1. Instale o Node.js 18+ (https://nodejs.org).
2. Nesta pasta: `npm install`
3. `npm run dev` e abra o endereço mostrado (ex.: http://localhost:5173).
4. Para gerar a versão final: `npm run build` (arquivos em `dist/`; teste com `npm run preview`).

## Estrutura
- `src/hooks/useTurbineSimulation.js` — estado e modelo matemático simplificado
- `src/scenes/MainScene.jsx` — cena 3D (luzes, câmera, chão)
- `src/components/` — Turbine3D, TurbineBlades, Generator3D, LightBulb, WindParticles, EnergyFlow, ExplodedView, ControlPanel, Indicators, ExplanationPanel
- `src/data/content.js` — textos didáticos (fácil de editar)

Os valores exibidos são uma representação conceitual, não medições reais.
