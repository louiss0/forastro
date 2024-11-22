import { glob } from "fast-glob";

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

});
