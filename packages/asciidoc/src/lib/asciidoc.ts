import asciidoctor, { Extensions } from "asciidoctor";
import { type Loader } from "astro/loaders";
import { asciidocConfigObjectSchema, createForAstroRegistryAsciidocFromConfig, generateSlug, getAsciidocPaths, getLoadAsciidocConfig, } from "./internal";
import type { z } from "astro/zod";


export type AsciidocConfigObject = z.infer<typeof asciidocConfigObjectSchema>


const processor = asciidoctor()

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

            if (paths.length === 0) {

                throw Error(`There are no files in this folder ${folder_name}.
                    Please use a different folder. 
                    `)

            }


            let registry: Extensions.Registry | undefined

            if (Object.keys(config).length !== 0) {

                logger.info(`Creating Asciidoc Registry from using config file`)

                registry = createForAstroRegistryAsciidocFromConfig(
                    config.blocks,
                    config.macros
                )
            }


            logger.info("Clearing the store")

            store.clear()

            logger.info("Extracting data from files then storing it")

            const fileNameToSlugMap = new Map<string, string>()

            const fullFilePathRE = /(?<folder_path>.+\/)(?<filename>[\w\s\d-]+)(?<extension>\.[a-z]+)/

            const SUPPORTED_ASCIIDOC_FILE_EXTENSIONS = [".adoc", ".asciidoc"]

            for (const path of paths) {


                const fullFilePathMatch = path.match(fullFilePathRE)

                if (!fullFilePathMatch) {


                    throw Error(`This path isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                        `)

                }

                const { filename } = fullFilePathMatch.groups!

                if (!filename) {

                    throw Error("There should be a word called filename in the word group")

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
                    id: generateSlug(filename),
                    data: attributes,
                    filePath: path
                })


                const sluggedFilename = generateSlug(filename);

                store.set({
                    id: sluggedFilename,
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

                fileNameToSlugMap.set(filename, sluggedFilename)

            }




            watcher?.on("add", async (path) => {

                const pathEndsWithOneOfTheSupportedAsciidocExtensions = SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.some(ext => path.endsWith(ext));

                if (!pathEndsWithOneOfTheSupportedAsciidocExtensions) return


                const fullFilePathMatch = path.match(fullFilePathRE)

                if (!fullFilePathMatch) {


                    throw Error(`This path ${path} isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                        `)

                }

                logger.info(`You added this file ${path} it's info will be now parsed an added to the store`)

                const { filename } = fullFilePathMatch.groups!

                if (!filename) {

                    throw Error("There should be a word called filename in the word group")

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
                    id: generateSlug(filename),
                    data: attributes,
                    filePath: path
                })


                const sluggedFilename = generateSlug(filename);

                store.set({
                    id: sluggedFilename,
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

                fileNameToSlugMap.set(filename, sluggedFilename)

                logger.info(`Finished adding the file now you can go to /${sluggedFilename} depending on your route to access it.`)


            })

            watcher?.on("change", async (path) => {


                const pathEndsWithOneOfTheSupportedAsciidocExtensions = SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.some(ext => path.endsWith(ext));

                if (!pathEndsWithOneOfTheSupportedAsciidocExtensions) return


                const filename = path.match(fullFilePathRE)![2]!

                logger.info(`You changed this file ${filename} the store is being updated`)

                const slug = fileNameToSlugMap.get(filename);

                if (!slug) {

                    throw Error(`A slug is supposed to exist using this file name ${slug}.
                        Some thing is wrong with the loader please file a report 
                        `)
                }

                store.delete(slug)

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
                    id: slug,
                    data: attributes,
                    filePath: path
                })


                store.set({
                    id: slug,
                    data,
                    filePath: path,
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

                logger.info(`The store is updated`)

            })


            watcher?.on('unlink', (path) => {


                const pathEndsWithOneOfTheSupportedAsciidocExtensions = SUPPORTED_ASCIIDOC_FILE_EXTENSIONS.some(ext => path.endsWith(ext));

                if (!pathEndsWithOneOfTheSupportedAsciidocExtensions) return


                const fullFilePathMatch = path.match(fullFilePathRE)

                if (!fullFilePathMatch) {


                    throw Error(`This path isn't correct.
                         A folder can use any set of characters but must end in a forward slash.
                         A filename must use word characters digits and whitespace no other characters.
                        `)

                }

                const { filename } = fullFilePathMatch.groups!

                if (!filename) {

                    throw Error("There should be a word called filename in the word group")

                }

                logger.info(`You deleted this file ${filename}`)

                const slug = fileNameToSlugMap.get(filename);

                if (!slug) {

                    throw Error(`A slug is supposed to exist using this file name ${slug}.
                        Some thing is wrong with the loader please file a report.
                        From unlink event using this path ${path}.
                        `)
                }

                store.delete(slug)

                logger.info("The store has now been updated!")

            })

            logger.info("Finished")

        },
    } satisfies Loader


}


export function asciidocLoader(folder_name: string) {

    return createAsciidocLoader(".", folder_name,)

}

