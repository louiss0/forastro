import { glob } from "fast-glob"
import { z } from "astro/zod"
import { loadConfig } from "c12"

const getAsciidocPathsSchema = z.function(
    z.tuple([
        z.string()
            .regex(
                /[\w+\/]/,
                "Don't pass in an empty string pass in a value with forward slashes and words instead")
    ]),
    z.promise(z.string().array())
)


export const getAsciidocPaths = getAsciidocPathsSchema.implement(async (folderName: string) => {

    return await glob("**/*.{adoc,asciidoc}", {
        cwd: folderName,
        absolute: true


    })

})


export const loadAsciidocConfig = async () => {


    const { config, } = await loadConfig({
        cwd: import.meta.dirname,
        name: "asciidoc",
        omit$Keys: true,

    })



    return config


}