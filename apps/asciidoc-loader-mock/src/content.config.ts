import { asciidocLoader } from "@forastro/asciidoc";
import { defineCollection, z } from "astro:content";


export const collections = {

    blog: defineCollection({
        loader: asciidocLoader('src/content'),
        schema: ({ image }) => z.object({
            doctitle: z.string(),
            heroImage: image().optional()
        })
    })

}