import asciidoctor from "asciidoctor";
import { type Loader } from "astro/loaders";
import { createForAstroRegistryAsciidocFromConfig, generateSlug, getAsciidocPaths, getLoadAsciidocConfig, } from "./internal";

const processor = asciidoctor()

export function createAsciidocLoader(config_folder_name: string, folder_name: string) {


    return {
        name: "forastro/asciidoc-loader",
        async load({ store, generateDigest, logger, parseData, }) {

            logger.info("Loading Asciidoc paths and config file")

            const [config, paths] = await Promise.all(
                [
                    getLoadAsciidocConfig(config_folder_name)(),
                    getAsciidocPaths(folder_name)

                ]
            )


            logger.info("Creating Asciidoc Registry from using config file")

            const registry = createForAstroRegistryAsciidocFromConfig(
                config.blocks,
                config.macros
            )


            logger.info("Clearing the store")

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

                    throw Error(
                        `Please supply a title for the file in this path ${path}`
                    )

                }

                const attributes = document.getAttributes()


                const data = await parseData({
                    id: generateSlug(title),
                    data: attributes,
                    filePath: path
                })


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

            logger.info("Finished")


        },
    } satisfies Loader


}


export function asciidocLoader(folder_name: string) {

    return createAsciidocLoader(".", folder_name,)

}

