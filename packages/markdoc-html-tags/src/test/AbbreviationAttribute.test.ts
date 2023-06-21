import { AbbreviationAttribute, } from 'src/lib/schema/abbreviation';
// import { generateMarkdocErrorObject } from "src/utils";


describe("Abbreviation Attribute works as intended", () => {


  const abbreviationAttribute = new AbbreviationAttribute()

  it("Returns an error object when a false string is passed", () => {

    const res = abbreviationAttribute.returnMarkdocErrorObjectOrNothing("tyle")


    expect(res).not.toBeUndefined()

    expect(res).toMatchInlineSnapshot(`
      {
        "id": "invalid-attribute",
        "level": "critical",
        "message": "You are supposed to supply only words that are capitalised with Spaces.
                      This word tyle doesn't meet that condition.
                ",
      }
    `)

  })




  it("Returns an null a true string is passed", () => {

    const res = abbreviationAttribute.returnMarkdocErrorObjectOrNothing("Cascading Style")


    expect(res).toBeUndefined()



  })


})

