import { createAsciidocLoader } from "@forastro/asciidoc";
import { defineCollection, z } from "astro:content";


const asciidocLoader = createAsciidocLoader(
    "src/content"
)

export const collections = {

    blog: defineCollection({
        loader: asciidocLoader,
        schema: ({ image }) => z.object({
            doctitle: z.string(),
            hero_image: image().optional()
        })
    })

}