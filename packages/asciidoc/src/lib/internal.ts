import { glob } from "fast-glob"
import { z } from "astro/zod"
import { loadConfig } from "c12"
import asciidoctor from "asciidoctor"

const getAsciidocPathsSchema = z.function(
    z.tuple([
        z.string()
            .regex(
                /[\w\/]+/m,
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

const asciidocGlobalVariablesSchema = z.object({
    // TODO: When shiki highlighter is implemented add shiki as a word on the list
    sourceHighlighter: z.enum([
        "coderay",
        "highlight.js",
        "pygments",
        "rouge"
    ]).optional(),
    author: z.string()
        .regex(
            /[A-Z][a-z]+\s+[A-Z][a-z]+/,
            "The author's name must be a name and last name both capitalized with a space in between"
        )
        .optional(),
    email: z.string().email().optional(),
    backend: z.string().optional(),
    filetype: z.boolean().optional(),
    localdir: z.string().optional(),
    localdate: z.string().date().optional(),
    localdatetime: z.string().datetime().optional(),
    localtime: z.string().time().optional(),
    localyear: z.number().int().optional(),
    attributeMissing: z.enum(["drop", "drop-line", "skip", "warn"]).optional(),
    attributeUndefined: z.enum(["drop", "drop-line"]).optional(),
    experimental: z.boolean().optional(),
    appendixCaption: z.string().optional(),
    appendixNumber: z.string().optional(),
    appendixRefsig: z.string().optional(),
    cautionCaption: z.string().optional(),
    cautionNumber: z.string().optional(),
    cautionRefsig: z.string().optional(),
    cautionSignifier: z.string().optional(),
    exampleCaption: z.string().optional(),
    exampleNumber: z.string().optional(),
    figureCaption: z.string().optional(),
    figureNumber: z.number().optional(),
    footnoteNumber: z.number().optional(),
    importantCaption: z.string().optional(),
    lastUpdateLabel: z.string().optional(),
    listingCaption: z.string().optional(),
    listingNumber: z.number().optional(),
    noteCaption: z.string().optional(),
    partRefsig: z.string().optional(),
    partSignifier: z.string().optional(),
    prefaceTitle: z.string().optional(),
    tableCaption: z.string().optional(),
    tableNumber: z.string().optional(),
    tipCaption: z.string().optional(),
    tocTitle: z.string().optional(),
    untitledLabel: z.string().optional(),
    warningCaption: z.string().optional(),
    appName: z.string().optional(),
    idprefix: z.string().optional(),
    idseparator: z.string().optional(),
    leveloffset: z.enum(["0", "1", "2", "3", "4", "5"])
        .transform((input) => parseInt(input))
        .optional(),
    partnums: z.boolean().optional(),
    setanchors: z.boolean().optional(),
    sectids: z.boolean().optional(),
    sectlinks: z.boolean().optional(),
    sectnums: z.boolean().optional(),
    sectnumlevels: z.enum(["0", "1", "2", "3", "4", "5"])
        .transform((input) => parseInt(input))
        .optional(),
    titleSeparator: z.string().optional(),
    toc: z.enum(["auto", "left", "right", "macro", "preamble"])
        .or(z.literal(true))
        .optional(),
    toclevels: z.enum(["1", "2", "3", "4", "5"])
        .transform((input) => parseInt(input))
        .optional(),
    fragment: z.boolean().optional(),
    stylesheet: z.string().optional(),
});


const configObjectSchema = z.object({
    attributes: asciidocGlobalVariablesSchema.optional(),
    blocks: z.record(
        z.string(),
        z.object({
            context:
                z.enum(['example', 'listing', 'literal', 'pass', 'quote', 'sidebar']),
            processor: processorSchema
        })).optional(),

    macros: z.object({
        inline: z.record(
            z.string(),
            z.object({
                context: z.enum(['quoted', 'anchor']),
                processor: processorSchema,
            })).optional(),

        block: z.record(
            z.string(),
            z.object({
                context: z.enum(['example', 'listing', 'literal', 'pass', 'quote', 'sidebar']),
                processor: processorSchema,
            })).optional()
    }).optional()
}).strict()

export type AsciidocConfigObject = z.infer<typeof configObjectSchema>

export const getLoadAsciidocConfig = (cwd: string) => {


    const transformObjectKeysIntoDashedCase = (input: Record<string, any>) => {
        const toDashedCase = (str: string) =>
            str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

        return Object.fromEntries(
            Object.entries(input).map(([key, value]) => [toDashedCase(key), value])
        );
    }

    return async () => {


        const { config, configFile, } = await loadConfig({
            cwd,
            name: "asciidoc",
            omit$Keys: true,
        })

        if (Object.keys(config).length === 0) {
            return config
        }

        z.string()
            .regex(
                /asciidoc.config.m(?:ts|js)/,
                "The asciidoc config file must be a mts or mjs file"
            )
            .parse(configFile)




        return configObjectSchema.transform(({ attributes, blocks, macros }) => {

            return {
                attributes: attributes && transformObjectKeysIntoDashedCase(attributes),
                blocks,
                macros
            }


        }).parse(config)

    }

}

const processor = asciidoctor()


export const createForAstroRegistryAsciidocFromConfig = (
    blocks: AsciidocConfigObject['blocks'],
    macros: AsciidocConfigObject['macros']
) => {

    const registry = processor.Extensions.create("forastro/asciidoc")

    if (blocks) {

        for (const [name, { context, processor }] of Object.entries(blocks)) {

            registry.block(name, function () {

                this.process(function (parent, reader, attributes) {

                    this.createBlock(
                        parent,
                        context,
                        processor(reader.getString(), attributes),
                        attributes
                    )

                })


            })

        }


        if (macros?.inline) {

            for (const [name, { context, processor }] of Object.entries(macros.inline)) {

                registry.inlineMacro(name, function () {

                    this.process(function (parent, target, attributes) {

                        this.createInline(
                            parent,
                            context,
                            processor(target, attributes)
                        )

                    })

                })

            }

        }



        if (macros?.block) {

            for (const [name, { context, processor }] of Object.entries(macros.block)) {

                registry.blockMacro(name, function () {

                    this.process(function (parent, target, attributes) {

                        this.createBlock(
                            parent,
                            context,
                            processor(target, attributes),
                            attributes
                        )

                    })

                })

            }

        }

    }

    return registry


}


export const loadAsciidocConfig = getLoadAsciidocConfig(process.cwd())