import { getCollection, getEntryBySlug, getEntry, getDataEntryById, getEntries, type CollectionEntry } from 'astro:content';
import { throwUnless } from 'packages/utilities/src/lib/helpers';


type GetCollectionFunc = typeof getCollection;
type GetEntryBySlugFunc = typeof getEntryBySlug;
type GetEntryFunc = typeof getEntry;
type GetEntriesFunc = typeof getEntries;
type GetDataEntryByIdFunc = typeof getDataEntryById;

type CustomGetCollectionFunc = <
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


export const getCollectionDataList: CustomGetCollectionFunc = async (collection, filter) =>
    (await getCollection(collection, filter)).map(entry => ({ slug: entry.slug, ...entry.data }))


export const getEntryData = Object.assign(
    async (entry: Parameters<GetEntryFunc>[0]) => {

        const valueFromEntryOrEntryData = await getEntry(entry)

        return {
            slug: valueFromEntryOrEntryData.slug,
            ...valueFromEntryOrEntryData.data
        }

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


export const getDataEntryDataById = async (collection: Parameters<GetDataEntryByIdFunc>[0], id: Parameters<GetDataEntryByIdFunc>[1]) => {

    const dataEntryById = await getDataEntryById(collection, id);

    return {
        slug: dataEntryById.slug,
        ...dataEntryById.data
    }

}

export const getDataListFromEntries = async (entries: Parameters<GetEntriesFunc>[0]) =>
    (await getEntries(entries)).map((entry) => ({ slug: entry.slug, ...entry.data }));

type TypeOrArrayOfType<T> = T | Array<T>;



type MapNonStringOrNumberValuesToNever<T extends Record<string, unknown>> =
    { [K in keyof T]: T[K] extends string | number ? T[K] : never }

type MergeCollectionDataWithSlugAndId<T extends string> =
    Pick<CollectionEntry<T>, "slug">
    & MapNonStringOrNumberValuesToNever<CollectionEntry<T>["data"]
    >


type ReturnTypeOnlyIfIItsNotAnArray<U> = U extends Array<any> ? U[number] : U;


type Prettify<T> = { [k in keyof T]: T[k] } & {}

export const getCollectionPaths =
    async <
        T extends Parameters<GetCollectionFunc>[0],
        U extends TypeOrArrayOfType<keyof MergeCollectionDataWithSlugAndId<T>>,
    >(
        collection: T,
        by: U,
        filter?: Parameters<GetCollectionFunc>[1]
    ) => {


        const paramMap = new Map<PropertyKey, string | number>()

        const entries = await getCollection(
            collection,
            getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult(filter)
        );


        return entries.map((entry, index) => {


            if (index !== 0) {

                paramMap.clear()
            }

            if (typeof by === "string") {


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
                params: (
                    Object.fromEntries(paramMap) as
                    Prettify<Pick<MergeCollectionDataWithSlugAndId<T>, ReturnTypeOnlyIfIItsNotAnArray<U>>>
                ),
                props: { ...entry, render: entry.render }
            }
        });
    }


export const getCollectionDataListFilterDrafts: CustomGetCollectionFunc = async (collection, filter) =>
(
    await getCollectionDataList(
        collection,
        getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult(filter)
    )
);


function getCheckIfAnEntryDataDoesNotHaveADraftPropOrDraftPropIsFalsyWithFilterParameterResult(filter: Parameters<CustomGetCollectionFunc>[1]) {
    return (entry: Parameters<Exclude<typeof filter, undefined>>[0]) => {


        const draftIsNotInEntryDataOrDraftIsFalse = !("draft" in entry.data) || "draft" in entry.data && !entry.data["draft"];

        return draftIsNotInEntryDataOrDraftIsFalse && filter?.(entry);


    };
}

