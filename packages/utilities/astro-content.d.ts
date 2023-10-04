
declare module 'astro:content' {

    export { z } from 'astro/zod';
    export type CollectionEntry<C extends keyof AnyEntryMap> = AnyEntryMap[C][keyof AnyEntryMap[C]];

    type BaseSchemaWithoutEffects =
        | import('astro/zod').AnyZodObject
        | import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
        | import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
        | import('astro/zod').ZodIntersection<
            import('astro/zod').AnyZodObject,
            import('astro/zod').AnyZodObject
        >;

    type BaseSchema =
        | BaseSchemaWithoutEffects
        | import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

    export type SchemaContext = { image: ImageFunction };

    type DataCollectionConfig<S extends BaseSchema> = {
        type: 'data';
        schema?: S | ((context: SchemaContext) => S);
    };

    type ContentCollectionConfig<S extends BaseSchema> = {
        type?: 'content';
        schema?: S | ((context: SchemaContext) => S);
    };


    type AllValuesOf<T> = T extends any ? T[keyof T] : never;

    type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
        ContentEntryMap[C]
    >['slug'];

    export function getEntryBySlug<
        C extends keyof ContentEntryMap,
        E extends ValidContentEntrySlug<C> | (string & {})
    >(
        collection: C,
        // Note that this has to accept a regular string too, for SSR
        entrySlug: E
    ): E extends ValidContentEntrySlug<C>
        ? Promise<CollectionEntry<C>>
        : Promise<CollectionEntry<C> | undefined>;

    export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
        collection: C,
        entryId: E
    ): Promise<CollectionEntry<C>>;

    export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
        collection: C,
        filter?: (entry: CollectionEntry<C>) => entry is E
    ): Promise<E[]>;
    export function getCollection<C extends keyof AnyEntryMap>(
        collection: C,
        filter?: (entry: CollectionEntry<C>) => unknown
    ): Promise<CollectionEntry<C>[]>;

    export function getEntry<
        C extends keyof ContentEntryMap,
        E extends ValidContentEntrySlug<C> | (string & {})
    >(entry: {
        collection: C;
        slug: E;
    }): E extends ValidContentEntrySlug<C>
        ? Promise<CollectionEntry<C>>
        : Promise<CollectionEntry<C> | undefined>;
    export function getEntry<
        C extends keyof DataEntryMap,
        E extends keyof DataEntryMap[C] | (string & {})
    >(entry: {
        collection: C;
        id: E;
    }): E extends keyof DataEntryMap[C]
        ? Promise<DataEntryMap[C][E]>
        : Promise<CollectionEntry<C> | undefined>;
    export function getEntry<
        C extends keyof ContentEntryMap,
        E extends ValidContentEntrySlug<C> | (string & {})
    >(
        collection: C,
        slug: E
    ): E extends ValidContentEntrySlug<C>
        ? Promise<CollectionEntry<C>>
        : Promise<CollectionEntry<C> | undefined>;
    export function getEntry<
        C extends keyof DataEntryMap,
        E extends keyof DataEntryMap[C] | (string & {})
    >(
        collection: C,
        id: E
    ): E extends keyof DataEntryMap[C]
        ? Promise<DataEntryMap[C][E]>
        : Promise<CollectionEntry<C> | undefined>;

    /** Resolve an array of entry references from the same collection */
    export function getEntries<C extends keyof ContentEntryMap>(
        entries: {
            collection: C;
            slug: ValidContentEntrySlug<C>;
        }[]
    ): Promise<CollectionEntry<C>[]>;
    export function getEntries<C extends keyof DataEntryMap>(
        entries: {
            collection: C;
            id: keyof DataEntryMap[C];
        }[]
    ): Promise<CollectionEntry<C>[]>;

    // Allow generic `string` to avoid excessive type errors in the config
    // if `dev` is not running to update as you edit.





    type ContentValue = {
        id: string;
        slug: string;
        body: string;
        collection: string;
        data: InferEntrySchema<string>
    } & { render(): Render[".md"] }

    type ContentEntryMap = Record<string, Record<string, ContentValue>>;

    type DataEntryMap = {

    };

    type AnyEntryMap = ContentEntryMap & DataEntryMap;

    type ContentConfig = typeof import("../src/content/config");






}