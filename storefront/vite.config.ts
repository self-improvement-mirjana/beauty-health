/// <reference types="vitest/config" />

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const apiTarget = process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8080';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(configDir, 'src') },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
