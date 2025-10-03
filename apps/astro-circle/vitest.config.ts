import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      all: true,
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
