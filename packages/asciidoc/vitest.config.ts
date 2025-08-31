import { defineConfig } from 'vitest/config';

// Per repo policy, .astro components are excluded from tests/coverage.
// We focus on TypeScript modules only (loaders, schemas, plugins, utilities).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['**/__fixtures__/**', 'dist/**', 'coverage/**', 'mock-blog/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: '../../coverage/packages/asciidoc',
      exclude: ['**/__fixtures__/**', 'dist/**', 'coverage/**', 'mock-blog/**', 'src/lib/mocks/**'],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
