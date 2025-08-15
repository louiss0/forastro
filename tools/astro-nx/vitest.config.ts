import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vitest/tools/astro-nx',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/*.integration.spec.*',
      'src/generators/filesystem-integration.spec.ts',
      // Temporarily exclude workspace-dependent path resolution specs and nx-workspace heavy tests
      'src/internal/generate/paths.spec.ts',
      'src/generators/nx-workspace-integration.spec.ts'
    ],
    coverage: {
      reportsDirectory: '../../coverage/tools/astro-nx',
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
