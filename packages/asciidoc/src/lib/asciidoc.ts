import { glob } from "fast-glob";


describe("Testing fast glob", () => {


    it('works', async () => {

        const files = await glob('../posts/*.adoc')


        expect(files.length).not.toBeGreaterThan(0)


    })


})


