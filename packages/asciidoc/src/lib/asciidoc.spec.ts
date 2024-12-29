import { glob } from "fast-glob";
import { loadConfig, } from "c12";
import { loadAsciidocConfig, getAsciidocPaths, transformAsciidocFilesIntoAsciidocDocuments, createForAstroRegistryAsciidocFromConfig } from "./internal";
import { z } from "astro/zod";
import type { Document, Extensions } from "asciidoctor";


describe('asciidoc', () => {


    test("fast glob works", async () => {


        const filePaths = await glob("**/*.adoc",)


        expect(filePaths.length).toBeGreaterThan(0)


    })


    test("fast glob only grabs from a specific folder", async () => {


        const filePaths = await glob("**/*.adoc", { cwd: import.meta.dirname })

        expect(filePaths.length).toBeGreaterThan(0)

        expect(filePaths).toContain("mocks/posts/first.adoc")


    })

    test("c12 works", async () => {

        const { config } = await loadConfig({
            cwd: `${import.meta.dirname}/mocks/`,
            name: "asciidoc",
            omit$Keys: true,

        })


        expect(config).toBeDefined()

        expectTypeOf(config).toBeObject()


    })

    describe("Testing getAsciidocPaths", () => {


        it("works", async () => {

            const result = await getAsciidocPaths("packages/asciidoc/src/lib")

            expect(result).toBeDefined()

            expectTypeOf(result).toBeArray()



        })

        it("gets files based on if it's a .adoc or a .asciidoc extension", async () => {



            const result = await getAsciidocPaths("packages/asciidoc/src/lib")


            expect(result).toBeDefined()


            expectTypeOf(result).toBeArray()


            expect(result.some(value => value.endsWith(".adoc"))).toBeTruthy()

            expect(result.some(value => value.endsWith(".asciidoc"))).toBeTruthy()


        })


        it("gets paths from the specified directory only", async () => {

            const specifiedDirectory = "packages/asciidoc/src/lib";
            const result = await getAsciidocPaths(specifiedDirectory)


            expect(result.every((value) => !value.startsWith(specifiedDirectory)))
                .toBeTruthy()

        })

        it(
            "throws an error if the folder name that is passed in is empty",
            async () => {


                try {

                    await getAsciidocPaths('')

                } catch (error) {

                    expect(error).toBeInstanceOf(z.ZodError)

                    const newError = error as z.ZodError

                    expect(newError.format()).toMatchInlineSnapshot(`
            {
              "0": {
                "_errors": [
                  "Don't pass in an empty string pass in a value with forward slashes and words instead",
                ],
              },
              "_errors": [],
            }
          `)

                }


            })



    })


    const MOCK_FOLDER = `${import.meta.dirname}/mocks`


    describe("Testing loadAsciidocConfig", () => {


        it("does'nt throw an error on an empty file", async () => {

            // The mock folder has no config's and shouldn't. 
            // Passing the mocks folder prevents creating a random empty folder

            try {
                const result = await loadAsciidocConfig(`${MOCK_FOLDER}`)

                expect(Object.keys(result).length).toBe(0)

            } catch (error) {

                expect(error).toBeUndefined()

            }



        })


        it("works", async () => {



            const result = await loadAsciidocConfig(`${MOCK_FOLDER}/configs`)


            expectTypeOf(result).toBeObject()

            expect(Object.getPrototypeOf(result) === Object.prototype).toBeTruthy()


        })

    })


    it(
        "throws an error when a file is a not an m js or ts file",
        async () => {

            try {

                const result = await loadAsciidocConfig(
                    `${MOCK_FOLDER}/false-config`
                )

                expect(Object.keys(result).length).toBe(0)

            } catch (error) {

                expect(error).toBeInstanceOf(z.ZodError)


                const newError = error as z.ZodError


                expect(newError.errors[0]?.message).toMatchInlineSnapshot(`"The asciidoc config file must be a mts or mjs file"`)

            }


        })

    it("throws an error when the config file doesn't have the right properties", async () => {


        try {

            const result = await loadAsciidocConfig(
                `${MOCK_FOLDER}/configs/bad-props`
            )

            expect(Object.keys(result).length).toBe(0)

        } catch (error) {

            expect(error).toBeInstanceOf(z.ZodError)

            const newError = error as z.ZodError

            expect(newError.errors.every(
                error => error?.message.match(/Unrecognized key\(s\) in object: '\w+'/)
            )).toBeTruthy()


        }




    })


    describe("Testing transformAsciidocFilesIntoAsciidocDocuments", () => {


        const $it = it.extend<{ documents: Array<Document> }>({
            async documents({ }, use) {

                const result = await transformAsciidocFilesIntoAsciidocDocuments(
                    `${MOCK_FOLDER}/posts`,
                    `${MOCK_FOLDER}/configs`
                )


                await use(result)

            }

        })

        $it("works", async ({ documents }) => {




            expectTypeOf(documents).toBeArray()

            expect(documents.length).toBeGreaterThan(0)


            for (const item of documents) {

                expectTypeOf(item).toEqualTypeOf<Document>()

            }


        })


        $it("registers attributes defined in the config file ", ({ documents }) => {


            documents.forEach(document => {

                expect(document.getAttributes())
                    .toHaveProperty("author", "Shelton Louis")

            })


        })



    })


    describe("Testing createForAstroRegistryAsciidocFromConfig", () => {


        const $it = it.extend<{ registry: Extensions.Registry }>({

            async registry({ }, use) {

                const { blocks, macros } = await loadAsciidocConfig(`${MOCK_FOLDER}/configs`)


                use(createForAstroRegistryAsciidocFromConfig(blocks, macros))

            }




        })


        $it("registers blocks found in the global config file", ({ registry }) => {

            expect(registry.hasBlocks()).toBeTruthy()

        })

        $it("registers inline macros found in the global config file", ({ registry }) => {

            expect(registry.hasInlineMacros()).toBeTruthy()

        })


        $it("registers block macros found in the global config file", ({ registry }) => {


            expect(registry.hasBlockMacros()).toBeTruthy()


        })

    })






});
