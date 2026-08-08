import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const entorno = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'API_URL'],
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: entorno.VITE_PROXY_API || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: { host: '0.0.0.0', port: 4173 },
    test: {
      environment: 'jsdom',
      setupFiles: './src/pruebas/configuracionPruebas.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/main.jsx', 'src/pruebas/**'],
      },
    },
  };
});
