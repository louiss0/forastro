import { glob } from "fast-glob"
import { object, z } from "astro/zod"
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

const configFileSchema = z.string()
    .regex(
        /asciidoc.config.m(?:ts|js)/,
        "The asciidoc config file must be a mts or mjs file"
    )


const blockContextSchema = z.enum(['example', 'listing', 'literal', 'pass', 'quote', 'sidebar'])

const inlineContextSchema = z.enum(['quoted', 'anchor'])



const processorSchema = z.function(
    z.tuple([
        z.string(),
        z.record(
            z.string(),
            z.union([
                z.string(),
                z.number(),
                z.boolean()
            ])
        )
    ]),
    z.string()
)
const configObjectSchema = z.object({

    attributes: z.record(z.string(), z.unknown()).optional(),
    blocks: z.record(
        z.string(),
        z.object({
            context: blockContextSchema,
            processor: processorSchema
        })).optional(),
    macros: z.object({
        inline: z.record(
            z.string(),
            z.object({
                context: inlineContextSchema,
                processor: processorSchema,
            })),
        block: z.record(
            z.string(),
            z.object({
                context: blockContextSchema,
                processor: processorSchema,
            }))
    }).optional()
}).strict()

export const getLoadAsciidocConfig = (cwd: string) => {


    return async () => {


        const { config, configFile } = await loadConfig<z.infer<typeof configObjectSchema>>({
            cwd,
            name: "asciidoc",
            omit$Keys: true,
        })

        configFileSchema.parse(configFile)

        configObjectSchema.parse(config)


        return config

    }

}

export const loadAsciidocConfig = getLoadAsciidocConfig(import.meta.dirname)