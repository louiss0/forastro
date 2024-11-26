import { glob } from "fast-glob";
import { loadConfig, } from "c12";

import { loadAsciidocConfig, getAsciidocPaths } from "./internal"
import { z } from "astro/zod";

describe('asciidoc', () => {


  test("fast glob works", async () => {


    const filePaths = await glob("**/*.adoc",)


    expect(filePaths.length).toBeGreaterThan(0)


  })


  test("fast glob only grabs from a specific folder", async () => {


    const filePaths = await glob("**/*.adoc", { cwd: import.meta.dirname })

    expect(filePaths.length).toBeGreaterThan(0)

    expect(filePaths).toContain("posts/page.adoc")


  })

  test("c12 works", async () => {

    const { config } = await loadConfig({
      cwd: import.meta.dirname,
      name: "asciidoc",
      omit$Keys: true,

    })


    expect(config).toBeDefined()

    expectTypeOf(config).toBeObject()



    expect(config).toHaveProperty("attributes")


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

  describe("Testing loadAsciidocConfig", () => {


    it("works", async () => {


      const result = await loadAsciidocConfig()


      expectTypeOf(result).toBeObject()

      expect(Object.getPrototypeOf(result) === Object.prototype).toBeTruthy()


    })

  })





});
