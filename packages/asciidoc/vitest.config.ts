import { defineConfig } from 'vitest/config';

// Per repo policy, .astro components are excluded from tests/coverage.
// We focus on TypeScript modules only (loaders, schemas, plugins, utilities).
//
// Coverage thresholds are set based on testable modules:
// - 100% coverage on schemas and plugins (index.ts, tailwind.ts)
// - 71% coverage on internal utilities (internal.ts)
// - Partial coverage on loader (asciidoc.ts) due to complex integration dependencies
// - The main loader integration tests are disabled due to mocking complexity
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
      exclude: [
        '**/__fixtures__/**', 
        'dist/**', 
        'coverage/**', 
        'mock-blog/**', 
        'src/lib/mocks/**',
        'lib/**',
        '*.config.*',
        'index.js',
        'index.d.ts',
        '**/*.spec.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'tsup.config.ts',
        'src/lib/unocss.ts',
        'src/lib/unocss.spec.ts'
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 85,
        functions: 50,
      },
    },
  },
});
