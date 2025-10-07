import { defineConfig } from 'tsup';
import { resolve } from 'node:path';

// Note: We compile to ESM and preserve the src/ directory structure under dist/src/**.
// This matches the existing package.json which points implementations to ./dist/src/**.
export default defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  // emit compiled JS into the publish root under workspace dist/packages/nx-astro-plugin/dist/src
  outDir: '../../dist/packages/nx-astro-plugin/',
  format: ['esm'],
  platform: 'node',
  target: 'node18',
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  dts: false,
  // Run from workspace root via Nx; ensure tsup resolves paths relative to the plugin root
  // by setting tsconfig explicitly and letting entry globs drive the structure.
  tsconfig: resolve(__dirname, 'tsconfig.json'),
});
