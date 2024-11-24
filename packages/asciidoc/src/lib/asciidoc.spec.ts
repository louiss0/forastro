import { glob } from "fast-glob";
import { loadConfig, } from "c12";
import { createJiti } from "jiti";
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

});
