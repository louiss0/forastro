import { glob } from "fast-glob"
import { z } from "astro/zod"


const getAsciidocPathsSchema = z.function(
    z.tuple([
        z.string()
            .regex(/\w+/, "Don't pass in an empty string pass in a value with slashes instead")
    ]),
    z.promise(z.string().array())
)


export const getAsciidocPaths = getAsciidocPathsSchema.implement(async (folderName: string) => {




    return await glob("**/*.{adoc,asciidoc}", {
        cwd: folderName,
        absolute: true


    })
})

