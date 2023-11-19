# Content Collection Helpers

These functions are an API on top of the get collection from `"astro:content"`
They are created to format the data that comes from Astro in a way where you
get the data you need and nothing more. When using content collections.
You have to write lots of boilerplate code to take care of common problems.

`getCollection` vs `getCollectionDataList`.

```ts
import { getCollection, } from 'astro:content';

const dataAndSlugList = (await getCollection("posts"))
    .map(entry => ({ slug: entry.slug, ...entry.data }))
```

```ts
import { getCollectionDataList, } from '@forastro/utilities';

const dataAndSlugList = (await getCollectionDataList("posts"))

type EntryDataAndSlug<T extends string> = {slug:string} & CollectionEntry<T>["data"] 

```

The data that is expected from them is a promise from one of the types below.

```ts
type EntryDataAndSlug<T extends string> = {slug:string} & CollectionEntry<T>["data"]

type EntryDataAndSlugs<T extends string> = Array<EntryDataAndSlug<T>>

```

## Get Collection Data List

```ts

type EntryIsNotADraft<T extends CollectionKey> = Omit<CollectionEntry<T>, "data"> & {
    data: NonNullable<CollectionEntry<T>["data"] & { draft: false | undefined }>;
};

type EntryIsADraft<T extends CollectionKey> = Omit<CollectionEntry<T>, "data">
    & {
        data: NonNullable<CollectionEntry<T>["data"] & { draft: true }>;
    };

const getCollectionDataList = 
    <C extends string, E extends CollectionEntry<C>>
    (collection: C, filter?: ((entry: E) => entry is E) | undefined): Promise<EntryDataAndSlugs<C>>;

getCollectionDataList.filterNonDrafts = <
        <
        T extends CollectionKey,
        U extends EntryIsNotADraft<T>
    >(collection: T, filter?: FilterFunction<T, U>) =>
        Promise<
            Array<
                Pick<
                    U,
                    "slug"
                >
                & U["data"]
            >
        >;

getCollection.filterDrafts =  <
        T extends CollectionKey,
        U extends EntryIsADraft<T>
    >(collection: T, filter?: FilterFunction<T, U>) =>
        Promise<
            Array<
                Pick<
                    U,
                    "slug"
                >
                & U["data"]
            >
        >

```

`getCollectionDataList()` is a function that allows gets a collection of entries.
It takes in a filter function that allows you to filter for the ones you want.
It returns a list of all the `data:` from the entry and the `slug:`.

This function comes with two functions that are attached to it as properties.
The first one is `filterDrafts()` which filters drafts that aren't posts.
The second one is `filterDrafts()` which filters for posts that are drafts.

Usage

```ts
import { getCollectionDataList, } from '@forastro/utilities';

const nonDraftedPosts = getCollectionDataList.filterNonDrafts("posts")
  
const draftedPosts = getCollectionDataList.filterDrafts("posts")

```

## Get Collection Paths

```ts

type TypeOrArrayOfType<T> = T | Array<T>;

type MapNonStringOrNumberValuesToNever<T extends Record<string, unknown>>= { 
        [K in keyof T]: T[K] extends string | number ? T[K] : never 
    }

type MergeCollectionDataWithSlugAndId<T extends string> =
    Pick<CollectionEntry<T>,  "slug">
    & MapNonStringOrNumberValuesToNever<CollectionEntry<T>["data"]
    >


type ReturnTypeOnlyIfIItsNotAnArray<U> = U extends Array<any> ? U[number] : U;


type ParamsObjectStructure<T extends string, U extends NonNullable<unknown>> = Pick<
    MergeCollectionDataWithSlugAndId<T>,
    ReturnTypeOnlyIfIItsNotAnArray<U>
>


const getCollectionDataList: <
        T extends string,
        U extends TypeOrArrayOfType<keyof MergeCollectionDataWithSlugAndId<T>>,
    >(
        collection: T,
         by: U, 
         filter?: (entry: CollectionEntry<T>) => entry is E) 
    ) => 
    Promise< 
        Array<{
            params: {
                [K in keyof ParamsObjectStructure<T,U>]:MergeCollectionDataWithSlugAndId<T>[K]
            };
            props: MergeCollectionDataWithSlugAndId<T>;
        }>
>

```

`getCollectionPaths()` is a function that automatically gets all the values from the collection.
Then it returns a list of objects that contains a params object and a props object.
The `by` parameter tells this function what params to map to the `params:` object.
Each entry will be mapped to props. It uses a filter that searches for the posts that are not drafts.
You can pass in a filter for even better filtering.

:::info
 The entry is the props in the props object.
:::

:::warning
`getCollectionPaths()` will always get the posts that are not drafts.
:::

## Get Collections

```ts
    <
    T extends Array<CollectionKey>,
    U extends CollectionEntry<T[number]>,
    F extends FilterFunction<T[number], U> | undefined = undefined
>(
    collectionNames: T,
    filter?: F
) => F extends FilterFunction<T[number], U>
    ? Promise<Array<U>>
    : Promise<Array<CollectionEntry<T[number]>>>

```

The `getCollections()` is a function that gets multiple collections.
It queries them in order based on the list of collections you want.
It' also allows you to pass in a filter based that filter will apply
to all the queries for each collection.

:::tip Create your own `getAllCollections()`

Since you can get as many collections as you want
you can also get all collections by using this function.

```ts
  import {z, defineCollection} from "@forastro/utilities"
  
  export const collections {
    typescript: defineCollection({
        schema: z.object(
            {
                title: z.string(),
                description: z.string(),
                pubDate: z.string()
                .transform((value=> new Date(value)))
            }
        )
    }),
    solid: defineCollection({
        schema: z.object(
            {
                title: z.string(),
                description: z.string(),
                pubDate: z.string()
                .transform((value=> new Date(value)))
            }
        )
    })
    react: defineCollection({
        schema: z.object(
            {
                title: z.string(),
                description: z.string(),
                pubDate: z.string()
                .transform((value=> new Date(value)))
            }
        )
    })
  }

export const collectionNames = Object.keys(collections) as
Array<keyof typeof collections>

export const getAllCollections = (filter?:(entry:CollectionEntry<CollectionKey>)=>boolean)=>
getCollections(collectionNames, filter)


```

:::

## Get Entry Data

```ts
    const getEntryData: (
        <C extends string, E extends string>(
            collection:C, 
            slugOrID:E
        ) => Promise<EntryDataAndSlug<C>>)
        & {
            bySlug: <C extends string, E extends string>(
                    collection: C,
                     slug: E
            ) => Promise<EntryDataAndSlug<C>>;
        }  
```

`getEntryData()` is a function that allows gets an entry.
It takes in a filter function that allows you to filter for the ones you want.
It returns a list of all the `data:` from the entry and the `slug:`.
It has a `bySlug()` modifier that allows you to just get the entry by the slug.

## Get Data List From Entries

```ts
    const getDataListFromEntries: <C extends string, E extends string>
        (
            entries:Array<{collection:C, slug:E } | {collection:C, id:E }>
        ) => Promise<EntryDataAndSlug<C>>
```

`getEntries()` is a function that returns multiple collection entries
from the same collection. But it only returns a list of each entry data
and the slug.
