import { defineCollection, z } from 'astro:content';

import { asciidocBaseSchema, asciidocLoader } from '../../../asciidoc';

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: asciidocLoader('src/content'),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    asciidocBaseSchema.and(
      z.object({
        pubDate: z.coerce.date().optional(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
      }),
    ),
});

export const collections = { blog };
