import { AnchorAttribute } from "src/lib/schema/anchor";
import { describe, expect, it } from "vitest";


describe("Make sure the AnchorAttribute's returnMarkdocErrorObjectOrNull ", () => {


    const anchorAttribute = new AnchorAttribute()

    it("returns an error when a random string is passed ", () => {

        const res = anchorAttribute
            .returnMarkdocErrorObjectOrNothing("foo")

        expect(res).not.toBe(null)


        expect(res).toMatchInlineSnapshot(`
          {
            "id": "invalid-path",
            "level": "error",
            "message": "This value foo is not a valid href attribute.
                    It must be one of these things.
                    A word with a / or a # at the beginning of the string.
                    A valid HTTP URL.
                    A valid mailto string 
                    A valid tel string. 
                    A relative or absolute path.",
          }
        `)


    })


    it("does'nt return an error when a valid http string is passed", () => {

        const res = anchorAttribute.returnMarkdocErrorObjectOrNothing("https://astro.build")

        expect(res).toBe(null)

    })

    it("does'nt return an error when an absolute path is passed", () => {
        const res = anchorAttribute.returnMarkdocErrorObjectOrNothing("/boo/56.md")

        expect(res).toBe(null)

    })

    it("does'nt return an error when an relative path is passed", () => {
        const res = anchorAttribute.returnMarkdocErrorObjectOrNothing("../boo/second-post.mdx")

        expect(res).toBe(null)

    })


    it("does'nt return an error when a mailto: string is passed", () => {
        const res = anchorAttribute.returnMarkdocErrorObjectOrNothing("mailto:resm@foo.com")

        expect(res).toBe(null)

    })

    it("does'nt return an error when a string that starts with a # is passed", () => {
        const res = anchorAttribute.returnMarkdocErrorObjectOrNothing("#boo")

        expect(res).toBe(null)

    })

    it("does'nt return an error when a valid tel: string is passed", () => {
        const res = anchorAttribute.returnMarkdocErrorObjectOrNothing("tel:2-907-33-0449")

        expect(res).toBe(null)

    })

})