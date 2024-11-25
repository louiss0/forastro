import { glob } from "fast-glob";
import { loadConfig, } from "c12";

import { getAsciidocPaths } from "./internal"

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

      const result = await getAsciidocPaths()

      expect(result).toBeDefined()

      expectTypeOf(result).toBeArray()



    })

    it("gets files based on if it's a .adoc or a .asciidoc extension", async () => {



      const result = await getAsciidocPaths()


      expect(result).toBeDefined()


      expectTypeOf(result).toBeArray()


      expect(result.some(value => value.endsWith(".adoc"))).toBeTruthy()

      expect(result.some(value => value.endsWith(".asciidoc"))).toBeTruthy()


    })




  })


});
