import { defineConfig } from 'tsup';
import { copyFileSync, cpSync } from 'fs';

export default defineConfig({
  entry: {
    index: 'src/index.js',
    'src/generators/init/impl': 'src/generators/init/impl.js'
  },
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node18',
  platform: 'node',
  shims: false,
  dts: false,
  external: ['@nx/devkit', 'fs-extra'],
  onSuccess: async () => {
    // Copy plugin.json to dist
    copyFileSync('plugin.json', 'dist/plugin.json');
    // Copy generator schema files to dist
    cpSync('generators', 'dist/generators', { recursive: true });
  }
});
