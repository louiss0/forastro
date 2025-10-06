import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/utilities/vitest.config.ts',
  'packages/asciidoc/vitest.config.ts',
  'packages/nx-astro-plugin/vitest.config.ts'
]);
