import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Pré-processa as bibliotecas 3D já ao iniciar o servidor, para que a
  // primeira abertura da página não fique travada carregando.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'three', '@react-three/fiber', '@react-three/drei', 'lucide-react'],
  },
  // Aviso de tamanho desativado: Three.js é naturalmente grande.
  build: { chunkSizeWarningLimit: 1500 },
});
