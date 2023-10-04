# Get Collection Helpers

These functions are an API on top of the get collection from `"astro:content"`
They are created to format the data that comes from Astro in a way where you
get the data you need and nothing more. When using content collections.
You have to write lots of boilerplate code to take care of common problems.

`getCollection` vs `getCollectionData`.

```ts
import { getCollection, } from 'astro:content';

const dataAndSlugList = (await getCollection("posts")).map(entry => ({ slug: entry.slug, ...entry.data }))
```

```ts
import { getCollectionDataList, } from '@forastro/utilities';

const dataAndSlugList = (await getCollectionDataList("posts"))
```

## Get Collection Data List

## Get Entry Data

## Get Data List From Entries

## Get Data Entry Data

## Get Collection Paths
