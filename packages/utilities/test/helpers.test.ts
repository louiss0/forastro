import { iterate, iterateRange, range, syncIterate } from "packages/utilities/src/lib/helpers";
import { IterationInfo } from "packages/utilities/src/lib/types";
import { z } from "astro/zod";
import type { CollectionKey } from "astro:content";
import { generateMock } from '@anatine/zod-mock';


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



type Collections<T extends string> = Record<T, Record<string, {
  id: string;
  slug: string;
  body: string;
  collection: string;
  data: Record<string, unknown>;
}>>;

type CollectionEntry<T extends string> = Collections<T>[T][keyof Collections<T>[T]]

type FilterFunction<
  T extends CollectionKey,
  U extends CollectionEntry<T>
> = (entry: CollectionEntry<T>) => entry is U;


type EntryIsNotADraft<T extends CollectionKey> = Omit<CollectionEntry<T>, "data"> & {
  data: NonNullable<CollectionEntry<T>["data"] & { draft: false | undefined }>;
};


function getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult
  <
    T extends CollectionKey,
    U extends CollectionEntry<T>
  >
  (
    filter?: FilterFunction<T, U>
  ) {


  return function (entry: CollectionEntry<T>): entry is U & EntryIsNotADraft<T> {


    const draftIsNotInEntryDataOrDraftIsFalse = !("draft" in entry.data) || "draft" in entry.data && !entry.data["draft"];

    return draftIsNotInEntryDataOrDraftIsFalse || !!filter?.(entry);



  };
}

type EntryIsADraft<T extends CollectionKey> = Omit<CollectionEntry<T>, "data">
  & {
    data: NonNullable<CollectionEntry<T>["data"] & { draft: true }>;
  };


function getCheckIfAnEntryDataHasADraftPropOrDraftPropIsTruthyWithFilterParameterResult<
  T extends CollectionKey,
  U extends CollectionEntry<T>
>(filter?: FilterFunction<T, U> | undefined) {

  return function (entry: CollectionEntry<T>): entry is U & EntryIsADraft<T> {

    const draftIsInEntryDataOrDraftIsTrue = "draft" in entry.data
      || "draft" in entry.data && entry.data["draft"] === true;

    return draftIsInEntryDataOrDraftIsTrue || !!filter?.(entry);


  };
}



const collectionEntrySchema = z.object({
  id: z.string().max(10),
  slug: z.string().max(35),
  body: z.string().min(100).max(250),
  collection: z.string().max(10),
  data: z.object({
    draft: z.boolean().or(z.undefined()),
    title: z.string(),
    description: z.string().min(15).max(60),
    pubDate: z.string().datetime(),
    updateDate: z.string().datetime(),
  })
})

const collectionEntryDraftsSchema = collectionEntrySchema.extend(
  {
    data: collectionEntrySchema.shape.data.extend(
      {
        draft: z.literal(true),
      }
    )
  }
)

const collectionEntryNonDraftsSchema = collectionEntrySchema.extend(
  {
    data: collectionEntrySchema.shape.data.extend(
      {
        draft: z.literal(false).or(z.undefined()),
      }
    )
  }
)


const collectionsSchema = z.object({
  angular: z.object({
    post: collectionEntrySchema,
    post2: collectionEntrySchema,
    post3: collectionEntryNonDraftsSchema,
    post4: collectionEntrySchema,
    post5: collectionEntryDraftsSchema,
    post6: collectionEntrySchema,
  }),
  typescript: z.object({
    post: collectionEntrySchema,
    post2: collectionEntryNonDraftsSchema,
    post3: collectionEntrySchema,
    post4: collectionEntryDraftsSchema,
    post5: collectionEntrySchema,
  }),
  react: z.object({
    post: collectionEntryNonDraftsSchema,
    post2: collectionEntryDraftsSchema,
    post3: collectionEntrySchema,
    post4: collectionEntrySchema,
    post5: collectionEntryDraftsSchema,
  }),
  vue: z.object({
    post: collectionEntrySchema,
    post2: collectionEntrySchema,
    post3: collectionEntryNonDraftsSchema,
    post4: collectionEntrySchema,
    post5: collectionEntryDraftsSchema,
  }),
})

type CreatedCollections = z.infer<typeof collectionsSchema>;

const collections = generateMock(collectionsSchema)

function getCollection<T extends keyof CreatedCollections, U extends CollectionEntry<T>>(collection: T, filter: FilterFunction<T, U>) {


  const filteredValues = Object.values(collections[collection]).filter((value) => filter(value as U))


  return filteredValues as Array<U>



}

describe("Get content collection helpers", () => {


  describe("Testing functions that return functions that check if a entry is a draft or not", () => {


    describe("Testing getCheckIfAnEntryDataHasADraftPropOrDraftPropIsTruthyWithFilterParameterResult", () => {

      test("It works", () => {


        const result = getCollection(
          "react",
          getCheckIfAnEntryDataHasADraftPropOrDraftPropIsTruthyWithFilterParameterResult()
        )


        expect(result.length).toBeGreaterThan(0)


      })

      test("All values returned are drafts", () => {

        const result = getCollection(
          "vue",
          getCheckIfAnEntryDataHasADraftPropOrDraftPropIsTruthyWithFilterParameterResult()
        )

        expect(result.length).toBeGreaterThan(0)

        expect(result.every(value => value.data.draft === true))
      })


    })

    describe("Testing getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult", () => {


      test("It works", () => {


        const result = getCollection(
          "vue",
          getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult()
        )

        expect(result.length).toBeGreaterThan(0)



      })

    })


    test("All values returned aren't drafts", () => {

      const result = getCollection(
        "vue",
        getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult()
      )

      expect(result.length).toBeGreaterThan(0)

      expect(result.every(value => value.data.draft === false || value.data.draft === undefined))

    })


  })




})