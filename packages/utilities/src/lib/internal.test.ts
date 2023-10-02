import { generateIterationInfoForIterablesThatAreNotGenerators, hasForEachMethod } from "packages/utilities/src/lib/internal"



const rikuMap = new Map<string, string | number>(
    [
        ['name', "Riku"],
        ['trait', "Quiet"],
        ['speed', 8],
        ['defense', 96]
    ]
)

describe("hasForEachMethod works well", () => {

    test("Function works with map", () => {


        expect(hasForEachMethod(rikuMap)).toBeTruthy()


    })

})



describe("generateIterationInfoForIterablesThatAreNotGenerators works well", () => {

    test("Function works with map", () => {


        const arrayFromRikuMap = Array.from(generateIterationInfoForIterablesThatAreNotGenerators(rikuMap))


        expect(arrayFromRikuMap).toBeInstanceOf(Array)

        expect(arrayFromRikuMap).toHaveLength(4)

        expect(arrayFromRikuMap).toMatchInlineSnapshot(`
      [
        {
          "info": IterationInfo {
            "firstIterationNum": 0,
            "iterationNum": 0,
            "lastIterationNum": 4,
          },
          "key": "name",
          "value": "Riku",
        },
        {
          "info": IterationInfo {
            "firstIterationNum": 0,
            "iterationNum": 1,
            "lastIterationNum": 4,
          },
          "key": "trait",
          "value": "Quiet",
        },
        {
          "info": IterationInfo {
            "firstIterationNum": 0,
            "iterationNum": 2,
            "lastIterationNum": 4,
          },
          "key": "speed",
          "value": 8,
        },
        {
          "info": IterationInfo {
            "firstIterationNum": 0,
            "iterationNum": 3,
            "lastIterationNum": 4,
          },
          "key": "defense",
          "value": 96,
        },
      ]
    `)
    })

})