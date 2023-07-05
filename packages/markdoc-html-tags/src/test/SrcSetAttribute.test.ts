import { SrcSetAttribute } from "packages/markdoc-html-tags/src/utils"




describe("Testing SizesAttribute.returnMarkdocErrorObjectOrNothing()", () => {


    const srcSetAttribute = new SrcSetAttribute()



    describe("returns an error when a value that is not a string or array is passed", () => {

        it.each([0, {}, "foo", [],])
            ("For the %# index it returns undefined", (value) => {




                const res = srcSetAttribute
                    .returnMarkdocErrorObjectOrNothing(value)



                expect(res).toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight()





            })
    })





    describe("returns undefined with passing in a string with a relative absolute path, and either a width viewport with", () => {


        it.each([
            "../foo/image.jpg 200w",
            "../foo/image.jpg 200w",
            "foo/image.jpg 200vw",
            "foo/image.jpg 200vw",
        ])("returns undefined with %s passed in", (value) => {


            const res = srcSetAttribute
                .returnMarkdocErrorObjectOrNothing(value)


            expect(res).toBeUndefined()



        })



    })


    describe("returns undefined with passing in a string with a relative absolute path, and either 1-2 pixel density", () => {

        it.each([
            "../foo/image.jpg 2x",
            "foo/image.jpg 2x",
            "../foo/image.jpg 1x",
            "foo/image.jpg 1x",
        ])("returns undefined with %s passed in", (value) => {


            const res = srcSetAttribute
                .returnMarkdocErrorObjectOrNothing(value)

            expect(res).toBeUndefined()


        })

    })



    describe("Returns a Error Object based on array shape", () => {


        describe("It returns an error object when the length of an array passed is less than two", () => {



            it.each([[""], ["", ""]])
                ("For this %# test index it returns a returns a MarkdocErrorObject ", (...values) => {


                    const res = srcSetAttribute
                        .returnMarkdocErrorObjectOrNothing(values)


                    expect(res).toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight()


                })

        })


        it("A MarkdocErrorObject is returned if one value is not a viable one", () => {


            const res = srcSetAttribute
                .returnMarkdocErrorObjectOrNothing([
                    "",
                    ""
                ])

            expect(res).toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight()


        })

        it.todo("A MarkdocErrorObject is returned if one value is not an absolute path with a width or viewport width", () => {


            const res = srcSetAttribute
                .returnMarkdocErrorObjectOrNothing([
                    "",
                    ""
                ])

            expect(res).toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight()


        })

        it.todo("A MarkdocErrorObject is returned if one value is not an relative path with a width or viewport width", () => {



        })


        it.todo("A MarkdocErrorObject is returned if one value is not an absolute path with a pixel density", () => {



        })

        it.todo("A MarkdocErrorObject is returned if one value is not an absolute path with a pixel density", () => {



        })


    })



})
