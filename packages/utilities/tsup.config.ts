import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  minify: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  publicDir: 'src/components',
});
