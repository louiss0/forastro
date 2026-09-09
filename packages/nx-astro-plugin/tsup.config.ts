import { defineConfig } from 'tsup';
import { resolve } from 'node:path';

// Runtime-only Nx plugin: ESM-only output, no sourcemaps, no type declarations
// Flattens output: src/ directory structure goes directly to dist/packages/nx-astro-plugin/
export default defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/templates/**',
  ],
  outDir: '../../dist/packages/nx-astro-plugin/',
  outBase: 'src',
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  splitting: false,
  clean: true,
  bundle: true,
  tsconfig: resolve(__dirname, 'tsconfig.json'),
});
