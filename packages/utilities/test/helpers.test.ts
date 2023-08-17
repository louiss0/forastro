// import { describe, expect, it, test } from "vitest";
import { generateIterationInfoForIterablesThatAreNotGenerators, hasForEachMethod, iterate, iterateRange, range, syncIterate } from "packages/utilities/src/lib/helpers";
import { IterationInfo } from "packages/utilities/src/lib/types";



async function generateArrayFromGenerator<T extends AsyncGenerator>(generator: AsyncGenerator) {



  const array: Array<Awaited<ReturnType<T["next"]>>["value"]> = []


  for await (const iterator of generator) {

    array.push(iterator)


  }

  return array

}


describe("Iterate  works", () => {



  test('When array is passed in the value is the first param index is second and iterable is the iteration info ', async () => {


    for await (const [value, info, key] of iterate(["james", "mary", "john"], (...args) => args)) {



      expect(value).toBeTypeOf("string")
      expect(key).toBeTypeOf("number")
      expect(info).toBeInstanceOf(IterationInfo)



    }


  })

  test('When set is passed in the value is the first param key is second and set is third ', async () => {


    for await (const [value, info, key] of iterate(new Set(["Mack", "Cain", "Ashton"]), (value, key, info) => [value, key, info])) {

      expect(value).toBeTypeOf("string")

      expect(key).toBeTypeOf("string")

      expect(info).toBeInstanceOf(IterationInfo)

    }

  })

  test('When map is passed in the value is the first param key is second and map is third ', async () => {

    for await (const [value, info, key] of iterate(new Map([[1, "mary"]]), (value, info, key) => [value, info, key,])) {

      expect(value).toBeTypeOf("string")
      expect(key).toBeTypeOf("number")
      expect(info).toBeInstanceOf(IterationInfo)

    }


  })


  test("IterationInfo's iteration number is plus one  the current index in an array ", async () => {


    for await (const [key, info] of iterate([2, 3, 5], (_, info, key) => [key, info] as const)) {

      expect(key).toBeTypeOf("number")

      expect(key).not.toBe(info.iteration)

      expect(key + 1).toBe(info.iteration)


    }




  })

  test("Array can be created nicely", async () => {


    const res = await generateArrayFromGenerator(iterate(["a", "b", "c"], (...args) => args))

    expect(res).toMatchInlineSnapshot(`
      [
        [
          "a",
          IterationInfo {
            "firstIterationNum": 0,
            "iterationNum": 0,
            "lastIterationNum": 3,
          },
          0,
        ],
        [
          "b",
          IterationInfo {
            "firstIterationNum": 0,
            "iterationNum": 1,
            "lastIterationNum": 3,
          },
          1,
        ],
        [
          "c",
          IterationInfo {
            "firstIterationNum": 0,
            "iterationNum": 2,
            "lastIterationNum": 3,
          },
          2,
        ],
      ]
    `)


  })


})


describe("Range works", () => {


  test("Numbers are counted from start to the stop number by one", () => {



    expect(Array.from(range(1, 5,)))
      .toStrictEqual([1, 2, 3, 4])



  })

  test("Numbers are counted from start to the stop number depending on step number", () => {



    expect(Array.from(range(1, 5,))).toHaveLength(4)


  })



  test("Numbers are counted up from start to the stop when step is positive", () => {



    expect(Array.from(range(1, 3, { step: 1 }))).toStrictEqual([1, 2])


  })



  it("throws when start is equal to stop", () => {


    expect(() => {

      for (const _ of range(1, 1, { step: 1 })) { }


    }).toThrowErrorMatchingInlineSnapshot('"Start can\'t be the same as stop"')

  })

  it("throws when step is equal to zero", () => {


    expect(() => {

      for (const _ of range(6, 4, { step: 0 })) { }

    }).toThrowErrorMatchingInlineSnapshot('"Step can\'t be zero or a negative number"')

  })


  test("The inclusive option works when start is less then stop", () => {


    const res = Array.from(range(1, 3, { inclusive: true }))


    expect(res).toStrictEqual([1, 2, 3])


  })

  test("The inclusive option works when stop is less then start", () => {


    const res = Array.from(range(3, 1, { inclusive: true }))


    expect(res).toStrictEqual([3, 2, 1,])


  })


})



describe("Iterate Range works", () => {

  test("Iterate Range has both the range number and an iteration number", async () => {


    for await (const [value, info] of iterateRange((value, info) => [value, info] as const, { start: 1, stop: 5, })) {

      expect(value).toBeTypeOf("number")

      expect(info).toBeInstanceOf(IterationInfo)

    }


  })



  test("The iteration is plus one of the value", async () => {


    for await (const [value, info] of iterateRange((value, info) => [value, info] as const, { start: 1, stop: 9 })) {

      expect(value).toBeTypeOf("number")

      expect(value + 1).toBe(info.iteration)

    }

  })





})


describe("Test iteration info", () => {


  test("See if the data returned from iteration info is calculated  from Parameters", () => {


    const res = new IterationInfo(1, 3, 5)


    expect(res.count).toBe(4)
    expect(res.isEven).toBe(false)
    expect(res.isFirst).toBe(false)
    expect(res.isLast).toBe(false)
    expect(res.iteration).toBe(4)
    expect(res.remaining).toBe(1)
    expect(res.isOdd).toBe(true)


  })


  const iterationInfo = new IterationInfo(1, 3, 5)

  test("IterationInfo count to be result of first iteration number subtracted from last iteration number", () => {


    expect(iterationInfo).toMatchInlineSnapshot(`
          IterationInfo {
            "firstIterationNum": 1,
            "iterationNum": 3,
            "lastIterationNum": 5,
          }
        `)



  },)

  test("remaining to be calculated from iteration number subtracted from last iteration number", () => {

    expect(iterationInfo).toMatchInlineSnapshot(`
          IterationInfo {
            "firstIterationNum": 1,
            "iterationNum": 3,
            "lastIterationNum": 5,
          }
        `)

    expect(iterationInfo.remaining).toBe(1)

  })

  test("IterationInfo isOdd to be true when an odd number is passed in and isEven to be opposite", () => {

    expect(iterationInfo).toMatchInlineSnapshot(`
          IterationInfo {
            "firstIterationNum": 1,
            "iterationNum": 3,
            "lastIterationNum": 5,
          }
        `)

    expect(iterationInfo.isOdd).toBe(true)
    expect(iterationInfo.isEven).toBe(false)


  })

  const iterationInfoTwo = new IterationInfo(2, 4, 6)

  test("IterationInfo isEven to be true when an odd number is passed in and isOdd to be opposite", () => {

    expect(iterationInfoTwo).toMatchInlineSnapshot(`
          IterationInfo {
            "firstIterationNum": 2,
            "iterationNum": 4,
            "lastIterationNum": 6,
          }
        `)

    expect(iterationInfoTwo.isOdd).toBe(false)
    expect(iterationInfoTwo.isEven).toBe(true)


  })

})

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

describe("Sync Iterate works", () => {

  test("Results are output when using a for of loop", () => {


    for (const iterator of syncIterate([4], (value) => value)) {



      expect(iterator).toBeTypeOf("number")


    }


  })


  test('should be able to be used with Array.from() ', () => {



    expect(Array.from(syncIterate(range(2, 6, { step: 1 }), (val) => val))).toBeInstanceOf(Array)

    expect(Array.from(syncIterate(range(2, 6, { step: 1 }), (val) => val))).toHaveLength(4)

  })



  test("It works with map's", () => {



    const map = new Map<string, string | number>(
      [
        ['name', "Riku"],
        ['defense', 96]
      ]
    )


    const arrayWithKeyAndValueFromSyncIterate =
      Array.from(syncIterate(
        map,
        (val, _, key) => [val, key]
      ))



    expect(arrayWithKeyAndValueFromSyncIterate)
      .toBeInstanceOf(Array)

    expect(arrayWithKeyAndValueFromSyncIterate)
      .toHaveLength(2)




  })

})

