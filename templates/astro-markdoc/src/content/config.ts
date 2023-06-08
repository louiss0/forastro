import { defineCollection, z } from 'astro:content';


export const collections = {
    blog: defineCollection(
        {
            type: "content",
            schema: z.object({
                title: z.string().min(5).max(90),
                description: z.string()
            })
        }
    )
}
