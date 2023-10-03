import { getCollection, getEntryBySlug, getEntry, getDataEntryById, getEntries } from 'astro:content';


type GetCollectionFunc = typeof getCollection;
type GetEntryBySlugFunc = typeof getEntryBySlug;
type GetEntryFunc = typeof getEntry;
type GetEntriesFunc = typeof getEntries;
type GetDataEntryByIdFunc = typeof getDataEntryById;

export const getCollectionData = async (collection: Parameters<GetCollectionFunc>[0], filter?: Parameters<GetCollectionFunc>[1]) =>

    (await getCollection(collection, filter)).map(entry => ({ slug: entry.slug, ...entry.data }))


export const getEntryData = Object.assign(
    async (entry: Parameters<GetEntryFunc>[0]) => {

        const result = await getEntry(entry)

        return {
            slug: result.slug,
            ...result.data
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

export const getDataFromEntries = async (entries: Parameters<GetEntriesFunc>[0]) =>
    (await getEntries(entries)).map((entry) => ({ slug: entry.slug, ...entry.data }));
