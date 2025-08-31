import { defineConfig } from 'vitest/config';

// Per repo policy, .astro components are excluded from tests/coverage.
// We focus on TypeScript modules only (hooks, utilities, loaders, schemas, plugins).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['src/components/**', '**/*.astro', 'dist/**', 'coverage/**', '**/__fixtures__/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: '../../coverage/packages/utilities',
      exclude: ['src/components/**', '**/*.astro', '**/__fixtures__/**', 'public/**', '**/*.spec.ts', '*.config.ts', 'vite.config.ts', 'vitest.config.ts', 'tsup.config.ts'],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
