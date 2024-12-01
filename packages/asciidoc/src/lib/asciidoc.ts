import asciidoctor from "asciidoctor";
import { type Loader } from "astro/loaders";
import { createForAstroRegistryAsciidocFromConfig, generateSlug, getAsciidocPaths, getLoadAsciidocConfig, } from "./internal";

const processor = asciidoctor()

const SUPPORTED_ASCIIDOC_FILE_EXTENSIONS = [".adoc", ".asciidoc"]

const fullFilePathRE = /(?<folder_path>.+\/)(?<file_name>[\w\s\d-]+)(?<extension>\.[a-z]+)/

export function createAsciidocLoader(config_folder_name: string, folder_name: string) {


    return {
        name: "forastro/asciidoc-loader",
        async load({ store, generateDigest, logger, parseData, watcher, }) {

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


                const fullFilePathMatch = path.match(fullFilePathRE)

                if (!fullFilePathMatch) {


                    throw Error(`This path isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                         The extensions must be ${SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.join(",")}
                        `)

                }

                const { file_name } = fullFilePathMatch.groups!

                if (!file_name) {

                    throw Error("There should be a word called file_name in the word group")

                }

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
                    id: generateSlug(file_name),
                    data: attributes,
                    filePath: path
                })


                store.set({
                    id: generateSlug(file_name),
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

            watcher?.on("all", async (_, path) => {



                const pathEndsWithOneOfTheSupportedAsciidocExtensions = SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.some(ext => path.endsWith(ext));

                if (!pathEndsWithOneOfTheSupportedAsciidocExtensions) return


                const fullFilePathMatch = path.match(fullFilePathRE)

                if (!fullFilePathMatch) {


                    throw Error(`This path isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                         The extensions must be ${SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.join(",")}
                        `)

                }

                const { file_name } = fullFilePathMatch.groups!

                if (!file_name) {

                    throw Error("There should be a word called file_name in the word group")

                }


                store.delete(file_name)

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
                    id: generateSlug(file_name),
                    data: attributes,
                    filePath: path
                })


                store.set({
                    id: generateSlug(file_name),
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


            })


        },
    } satisfies Loader


}


export function asciidocLoader(folder_name: string) {

    return createAsciidocLoader(".", folder_name,)

}

