import { getCollection, getEntryBySlug, getEntry, getEntries, type CollectionEntry } from 'astro:content';
import { throwUnless } from './conditional';


type GetCollectionFunc = typeof getCollection;
type GetEntryBySlugFunc = typeof getEntryBySlug;
type GetEntryFunc = typeof getEntry;
type GetEntriesFunc = typeof getEntries;

type GetCollectionDataFunc = <
    T extends Parameters<GetCollectionFunc>[0],
    U extends Parameters<GetCollectionFunc>[1]
>
    (collection: T, filter?: U) =>
    Promise<
        Array<
            Pick<
                CollectionEntry<T>,
                "slug"
            >
            & MapNonStringOrNumberValuesToNever<CollectionEntry<T>["data"]
            >
        >
    >


const _getCollectionDataList: GetCollectionDataFunc = async (collection, filter) =>
    (await getCollection(collection, filter)).map(entry => ({ slug: entry.slug, ...entry.data }))




const getCollectionDataListFilterNonDrafts: GetCollectionDataFunc = async (collection, filter) => (
    await _getCollectionDataList(
        collection,
        getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult(filter)
    )
);


const getCollectionDataListFilterDrafts: GetCollectionDataFunc = async (collection, filter) => (
    await _getCollectionDataList(
        collection,
        (entry): entry is Parameters<Exclude<typeof filter, undefined>>[0] => {

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

export const getEntryData = Object.assign(
    async (collection: Parameters<GetEntryFunc>[0], slugOrId: Parameters<GetEntryFunc>[1]) => {

        const valueFromEntryOrEntryData = await getEntry(collection, slugOrId)


        if ("slug" in valueFromEntryOrEntryData) {

            return {
                slug: valueFromEntryOrEntryData.slug,
                ...valueFromEntryOrEntryData.data
            }

        }


        return valueFromEntryOrEntryData.data


    },
    {
        bySlug: async (collection: Parameters<GetEntryBySlugFunc>[0], slug: Parameters<GetEntryBySlugFunc>[1]) => {

            const entryBySlug = await getEntryBySlug(collection, slug)

            return {
                slug: entryBySlug.slug,
                ...entryBySlug.data
            }

        },

    })


export const getDataListFromEntries = async (entries: Parameters<GetEntriesFunc>[0]) =>
    (await getEntries(entries)).map((entry) => ({ slug: entry.slug, ...entry.data }));

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
    T extends Parameters<GetCollectionFunc>[0],
    U extends TypeOrArrayOfType<keyof MergeCollectionEntryDataWithEntry<T>>,
    V extends Parameters<GetCollectionFunc>[1]
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
    async (
        collection,
        by,
        filter
    ) => {





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




function getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult(
    filter: Parameters<GetCollectionDataFunc>[1]
) {
    return function (
        entry: Parameters<Exclude<typeof filter, undefined>>[0]
    ): entry is Parameters<Exclude<typeof filter, undefined>>[0] {


        const draftIsNotInEntryDataOrDraftIsFalse = !("draft" in entry.data) || "draft" in entry.data && !entry.data["draft"];

        return draftIsNotInEntryDataOrDraftIsFalse && !!filter?.(entry);



    };
}

