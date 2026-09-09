import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/utilities/vitest.config.ts',
      'packages/asciidoc/vitest.config.ts',
      'packages/nx-astro-plugin/vitest.config.ts',
      '!vitest.config.mts',
    ],
  },
});
