import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    reporters: ['default'],
    coverage: {
      enabled: true,
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/schema.json',
        'src/generators/**/templates/**',
        'src/**/*.d.ts',
        'src/index.ts'
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
