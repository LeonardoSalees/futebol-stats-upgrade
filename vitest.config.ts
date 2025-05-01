
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Isso permite que você use describe, it, etc, globalmente
    environment: 'node', // Você pode usar 'jsdom' ou 'node' dependendo do seu caso
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // Alias @ aponta para a pasta src
    },
  },
});