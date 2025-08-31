import { defineCollection } from 'astro:content';
import { asciidocBaseSchema, asciidocLoader } from '../../../packages/asciidoc/src/index.js';

const blog = defineCollection({
  // Load AsciiDoc files in the `src/content/blog/` directory.
  loader: asciidocLoader('src/content/blog'),
  // Type-check frontmatter using a schema
  schema: () => asciidocBaseSchema,
});

export const collections = { blog };
