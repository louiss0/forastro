import { defineCollection, z } from 'astro:content';

import { asciidocBaseSchema, asciidocLoader } from '../../src/index';

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: asciidocLoader('src/content'),
  // Type-check frontmatter using a schema
  schema: () => asciidocBaseSchema,
});

export const collections = { blog };
