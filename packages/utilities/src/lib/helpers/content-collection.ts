import { getCollection, getEntryBySlug, getEntry, getEntries, type CollectionEntry, type CollectionKey } from 'astro:content';
import { throwUnless } from './conditional';


type GetEntryBySlugFunc = typeof getEntryBySlug;
type GetEntryFunc = typeof getEntry;
type GetEntriesFunc = typeof getEntries;

type FilterFunction<
    T extends CollectionKey,
    U extends CollectionEntry<T>
> = (entry: CollectionEntry<T>) => entry is U;

type GetCollectionDataListFunc = <
    T extends CollectionKey,
    U extends CollectionEntry<T>
>
    (collection: T, filter?: FilterFunction<T, U>) =>
    Promise<
        Array<
            Pick<
                U,
                "slug"
            >
            & U["data"]
        >
    >;

type GetCollectionDataListFilterDrafts =
    <
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

type GetCollectionDataListFilterNonDrafts =
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
        >
const _getCollectionDataList: GetCollectionDataListFunc = async (collection, filter) =>
    (await getCollection(collection, filter)).map(entry => ({ slug: entry.slug, ...entry.data }))




const getCollectionDataListFilterNonDrafts: GetCollectionDataListFilterNonDrafts =
    async (collection, filter) => (
        await _getCollectionDataList(
            collection,
            getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult(filter)
        )
    );

type EntryIsADraft<T extends CollectionKey> = CollectionEntry<T> & {
    data: { draft: true };
};

const getCollectionDataListFilterDrafts: GetCollectionDataListFilterDrafts = async (
    collection,
    filter
) => (
    await _getCollectionDataList(
        collection,
        (entry): entry is EntryIsADraft<typeof collection> => {

            const draftIsNotInEntryDataOrDraftIsFalse = "draft" in entry.data
                || "draft" in entry.data && entry.data["draft"] === true;

            return draftIsNotInEntryDataOrDraftIsFalse && !!filter?.(entry);


        }
    )
);
export const getCollectionDataList = Object.assign(
    _getCollectionDataList,
    {
        filterNonDrafts: getCollectionDataListFilterNonDrafts,
        filterDrafts: getCollectionDataListFilterDrafts,
    }
)

type GetEntryData =
    (collection: Parameters<GetEntryFunc>[0],
        slugOrId: Parameters<GetEntryFunc>[1]
    ) => Promise<Awaited<ReturnType<GetEntryFunc>>["data"] & {
        slug: Awaited<ReturnType<GetEntryFunc>>["slug"]
    }>

const _getEntryData: GetEntryData =
    async (collection, slugOrId) => {

        const valueFromEntryOrEntryData = await getEntry(collection, slugOrId);


        if ("slug" in valueFromEntryOrEntryData) {

            return {
                slug: valueFromEntryOrEntryData.slug,
                ...valueFromEntryOrEntryData.data
            };

        }


        return valueFromEntryOrEntryData.data;


    };

type GetEntryDataBySlug =
    (collection: Parameters<GetEntryBySlugFunc>[0], slug: Parameters<GetEntryBySlugFunc>[1]) =>
        Promise<Awaited<ReturnType<GetEntryBySlugFunc>>["data"] & {
            slug: Awaited<ReturnType<GetEntryBySlugFunc>>["slug"]
        }>


const getEntryDataBySlug: GetEntryDataBySlug = async (collection, slug) => {

    const entryBySlug = await getEntryBySlug(collection, slug);

    return {
        slug: entryBySlug.slug,
        ...entryBySlug.data
    };

};
export const getEntryData = Object.assign(
    _getEntryData,
    { bySlug: getEntryDataBySlug, }
)


type GetDataListFromEntries = (entries: Parameters<GetEntriesFunc>[0]) =>
    Promise<
        Array<
            Awaited<ReturnType<GetEntriesFunc>>[number]["data"] & {
                slug: Awaited<ReturnType<GetEntriesFunc>>[number]["slug"]
            }
        >
    >

export const getDataListFromEntries: GetDataListFromEntries = async (entries) =>
    (await getEntries(entries)).map((entry) => ({ slug: entry.slug, ...entry.data, }));

type TypeOrArrayOfType<T> = T | Array<T>;

type MapNonStringOrNumberValuesToNever<T extends Record<string, unknown>> =
    { [K in keyof T]: T[K] extends string | number ? T[K] : never }

type MergeCollectionEntryDataWithEntry<T extends string> =
    Omit<CollectionEntry<T>, "data" | "render" | "body">
    & MapNonStringOrNumberValuesToNever<CollectionEntry<T>["data"]
    >


type ReturnTypeOnlyIfIItsNotAnArray<U> = U extends Array<any> ? U[number] : U;


type Prettify<T> = { [k in keyof T]: T[k] } & {}


type GetCollectionPaths = <
    T extends CollectionKey,
    U extends TypeOrArrayOfType<keyof MergeCollectionEntryDataWithEntry<T>>,
    V extends FilterFunction<T, EntryIsNotADraft<T>>
>(
    collection: T,
    by: U,
    filter?: V
) => Promise<Array<{
    params: Prettify<
        Pick<
            MergeCollectionEntryDataWithEntry<T>,
            ReturnTypeOnlyIfIItsNotAnArray<U>
        >

    >;
    props: CollectionEntry<T>
}>>

export const getCollectionPaths: GetCollectionPaths =
    async (collection, by, filter) => {





        const paramMap = new Map<PropertyKey, string | number>()

        const entries = await getCollection(
            collection,
            getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult(filter)
        );


        const notAllowedKeys = ["render", "body"];
        return entries.map((entry, index) => {


            if (index !== 0) {

                paramMap.clear()
            }

            if (typeof by === "string") {



                if (notAllowedKeys.includes(by)) {


                    throw new Error(
                        `Don't use these ${notAllowedKeys.join(" ")} keys at all if you do the values from the entry will be used it will not come from the data.`
                    )

                }

                const valueFromEntryOrEntryData =
                    by in entry
                        ? entry[by as keyof typeof entry]
                        : by in entry["data"]
                            ? entry["data"][by]
                            : null


                throwUnless(
                    typeof valueFromEntryOrEntryData === "string" || typeof valueFromEntryOrEntryData === "number",
                    "You can only use strings and numbers as params",
                    "Invalid entry"
                )


                paramMap.set(by, valueFromEntryOrEntryData)

            }


            if (Array.isArray(by)) {

                by.forEach(key => {


                    if (typeof key === "string" && notAllowedKeys.includes(key)) {


                        throw new Error(
                            `Don't use these ${notAllowedKeys.join(" ")} keys at all if you do the values from the entry will be used it will not come from the data.`
                        )

                    }

                    const valueFromEntryOrEntryData =
                        key in entry
                            ? entry[key as keyof typeof entry]
                            : key in entry["data"]
                                ? entry["data"][key]
                                : null


                    throwUnless(
                        typeof valueFromEntryOrEntryData === "string" || typeof valueFromEntryOrEntryData === "number",
                        "You can only use strings and numbers as params",
                        "Invalid entry"
                    )

                    paramMap.set(key, valueFromEntryOrEntryData)
                })

            }

            return {
                params: Object.fromEntries(paramMap) as Prettify<
                    Pick<
                        MergeCollectionEntryDataWithEntry<typeof collection>,
                        ReturnTypeOnlyIfIItsNotAnArray<typeof by>
                    >
                >,
                props: entry
            }
        });
    }




type EntryIsNotADraft<T extends CollectionKey> = CollectionEntry<T> & {
    data: { draft: false | undefined };
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

        return draftIsNotInEntryDataOrDraftIsFalse && !!filter?.(entry);



    };
}


type GetCollections = <
    T extends Array<CollectionKey>,
    U extends CollectionEntry<T[number]>,
    F extends FilterFunction<T[number], U> | undefined = undefined
>(
    collectionNames: T,
    filter?: F
) => F extends FilterFunction<T[number], U>
    ? Promise<Array<U>>
    : Promise<Array<CollectionEntry<T[number]>>>

export const getCollections: GetCollections = async (collectionNames, filter) => {

    return (
        await Promise.all(
            collectionNames
                .map((collectionName) => getCollection(collectionName, filter))
        )
    ).flat()


}
