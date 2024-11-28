import { type Loader } from "astro/loaders";
import { loadAsciidocConfig, getAsciidocPaths, createForAstroRegistryAsciidocFromConfig } from "./internal";
import asciidoctor from "asciidoctor";

import slugify from "slugify"

const generateSlug = (string: string) => slugify(
    string,
    {
        lower: true,
        trim: true,
        remove: /[*+~.()'"!:@]/g
    })

const processor = asciidoctor()



export function asciidocLoader(folder_name: string, schema: Loader['schema']) {


    return {
        name: "forastro/asciidoc-loader",
        async load({ store, generateDigest, logger, parseData }) {


            logger.info("Loading Asciidoc paths and config file")

            const [config, paths] = await Promise.all(
                [
                    loadAsciidocConfig(),
                    getAsciidocPaths(folder_name)

                ]
            )

            logger.info("Creating Asciidoc Registry from using config file")

            const registry = createForAstroRegistryAsciidocFromConfig(
                config.blocks,
                config.macros
            )


            logger.info(" Clearing the store")

            store.clear()

            logger.info("Extracting data from files then storing it")

            for (const path of paths) {

                const document = processor.loadFile(
                    path,
                    {
                        attributes: config.attributes,
                        catalog_assets: true,
                        extension_registry: registry
                    })

                const title = document.getTitle();

                if (!title) {

                    return logger.error(
                        `Please supply a title for the file in this path ${path}`
                    )

                }

                const attributes = document.getAttributes()

                const data = await parseData(attributes)

                store.set({
                    id: generateSlug(title),
                    data,
                    digest: generateDigest(data),
                    rendered: {
                        metadata: {
                            frontmatter: data,
                            imagePaths: document.getImages().map(image => image.getTarget()),
                            headings: document.getSections()
                                .map(section => ({
                                    text: section.getTitle() ?? '',
                                    depth: section.getLevel(),
                                    slug: generateSlug(section.getTitle() ?? '')
                                })),

                        },
                        html: document.getContent() ?? ""
                    }
                })

            }


        },
        schema
    } satisfies Loader


}