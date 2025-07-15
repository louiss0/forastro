import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/lib/unocss.ts',
    'src/lib/tailwind.ts',
  ],
  format: ['esm'],
  dts: true, // Generate .d.ts files
  minify: true,
  clean: true, // Clean output directory before building
});
