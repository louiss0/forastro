import asciidoctor from 'asciidoctor';
import type { AstroIntegration, ContentEntryType } from 'astro';
import { generateSlug } from './lib/internal';
import { fileURLToPath } from 'node:url';

export * from './lib/asciidoc';

const processor = asciidoctor()

const SUPPORTED_ASCIIDOC_FILE_EXTENSIONS = [".adoc", ".asciidoc"]

export default function asciidocIntegration() {

    return {
        name: "@forastro/asciidoc",
        hooks: {

            "astro:config:setup": (params) => {

                const { addContentEntryType, logger } = params as typeof params & {
                    addContentEntryType: (contentEntryType: ContentEntryType) => void
                }

                logger.info("Setting up integration")

                addContentEntryType({
                    extensions: SUPPORTED_ASCIIDOC_FILE_EXTENSIONS,
                    getEntryInfo({ fileUrl, contents }) {

                        const document = processor.loadFile(fileURLToPath(fileUrl))

                        return {
                            data: document.getAttributes(),
                            body: document.getContent()!,
                            slug: generateSlug(document.getTitle()!),
                            rawData: contents
                        }

                    }
                })




            },

            "astro:server:setup": ({ server, logger }) => {

                const eventToMessageMap = {
                    add: "created",
                    change: "updated",
                    unlink: "removed"
                }

                function isKeyOfEventToMessageMap(value: string): value is keyof typeof eventToMessageMap {
                    return value in Object.keys(eventToMessageMap);
                }

                logger.info("Starting server")

                server.watcher.on("all", (event, entry) => {


                    const fileHasTheSupportedFileExtension =
                        SUPPORTED_ASCIIDOC_FILE_EXTENSIONS
                            .some(extension => entry.endsWith(extension));

                    if (fileHasTheSupportedFileExtension) {

                        if (isKeyOfEventToMessageMap(event)) {

                            logger.info(`This file was ${eventToMessageMap[event]} restarting`)
                        }

                        server.restart()
                    }


                })

                logger.warn("Asciidoc files are now being watched ! brace for server restart's")

            },
            "astro:server:done": ({ logger }) => {

                logger.info("Finished Setting up integration")

            },

        }
    } satisfies AstroIntegration


}