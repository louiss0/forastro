import { defineConfig } from 'vitest/config';

// Per repo policy, .astro components are excluded from tests/coverage.
// We focus on TypeScript modules only (hooks, utilities, loaders, schemas, plugins).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['src/**/__tests__/**/*.{spec,test}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist/**',
      'coverage/**',
      'src/components/**',
      '**/*.astro',
      '**/__fixtures__/**',
      '**/__mocks__/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: '../../coverage/packages/utilities',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/components/**',
        '**/*.astro',
        '**/__fixtures__/**',
        '**/__mocks__/**',
        'public/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '*.config.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'tsup.config.ts',
        // Projector-related exclusions (adjust paths as needed)
        'src/**/projector/**',
        'src/**/*Projector*.{ts,tsx}',
        'src/**/Projector/**',
        'src/**/projection/**'
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80,
      },
      excludeAfterRemap: true,
      reportOnFailure: true,
    },
  },
});
