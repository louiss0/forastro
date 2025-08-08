import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/integration.ts',
    'src/markdoc/index.ts',
  ],
  format: ['esm'],
  sourcemap: true,
  dts: {
    // Do not follow types into external packages (e.g., workspace libs exporting src)
    respectExternal: true,
  },
  clean: true,
  external: [
    // workspace/runtime externals
    'starlight-asciidoc',
    '@forastro/asciidoc',
    // treat astro component imports as external (relative to built markdoc/index.js)
    '../components/Admonition.astro',
    '../components/Tabs.astro',
    '../components/Tab.astro',
    '../components/Details.astro',
    '../components/Card.astro',
    '../components/Cards.astro',
    '../components/Figure.astro',
  ],
  onSuccess: 'node ./scripts/copy-astro.mjs',
});

