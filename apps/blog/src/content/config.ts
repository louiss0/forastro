import { defineCollection } from 'astro:content';
import { asciidocBaseSchema, asciidocLoader } from '@forastro/asciidoc';

const blog = defineCollection({
  loader: asciidocLoader('src/content'),
  schema: asciidocBaseSchema
});

export const collections = { blog };
