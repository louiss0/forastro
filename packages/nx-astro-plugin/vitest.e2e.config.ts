import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['e2e/src/**/*.{test,spec}.{js,ts}'],
    testTimeout: 300000,
    hookTimeout: 300000,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'coverage/', 'e2e/'],
    },
  },
  esbuild: {
    target: 'es2022',
  },
});
