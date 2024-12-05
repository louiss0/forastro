import { createAsciidocLoader } from "@forastro/asciidoc";
import { defineCollection, z } from "astro:content";


const asciidocLoader = createAsciidocLoader(
    "/apps/asciidoc-loader-mock",
    "apps/asciidoc-loader-mock/src/content"
)

export const collections = {

    blog: defineCollection({
        type: "content_layer",
        loader: asciidocLoader,
        schema: z.object({
            doctitle: z.string()
        })
    })

}