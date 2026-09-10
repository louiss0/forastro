import { defineCollection } from 'astro:content';
import {
  asciidocBaseSchema,
  asciidocLoader,
} from '../../../packages/asciidoc/src/index.js';

const blog = defineCollection({
  // Load AsciiDoc files in the `src/content/blog/` directory.
  // Pass the content root; the loader appends the collection name.
  loader: asciidocLoader('src/content'),
  // Type-check frontmatter using a schema
  schema: () => asciidocBaseSchema,
});

export const collections = { blog };
