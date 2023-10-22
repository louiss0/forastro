
declare module 'astro:content' {

    export { z } from 'astro/zod';

    export type CollectionEntry<C extends keyof AnyEntryMap> =
        AnyEntryMap[C][keyof AnyEntryMap[C]];


    type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

    export type CollectionKey = keyof AnyEntryMap;

    export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

    export type ContentCollectionKey = keyof ContentEntryMap;

    export type DataCollectionKey = keyof DataEntryMap;


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

    type ValidContentEntrySlug<C extends keyof ContentEntryMap> =
        AllValuesOf<
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


    export function getEntry<
        C extends keyof ContentEntryMap,
        E extends ValidContentEntrySlug<C> | keyof DataEntryMap[C]
    >(
        collection: C,
        slugOrId: E
    ): E extends keyof DataEntryMap[C]
        ? Promise<DataEntryMap[C][E]>
        : E extends ValidContentEntrySlug<C>
        ? Promise<CollectionEntry<C>>
        : Promise<CollectionEntry<C> | undefined>;


    /** Resolve an array of entry references from the same collection */
    export function getEntries<C extends keyof ContentEntryMap>(
        entries: Array<{
            collection: C;
            slug: ValidContentEntrySlug<C>;
        } | {
            collection: C;
            id: keyof DataEntryMap[C];
        }>
    ): Promise<CollectionEntry<C>[]>;


    type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;


    type RecordWithFiveObjectsNestedAndArraysDeepContainingType<T> = T extends new (...args: Array<any>) => any | Iterable<any> ? never
        : Record<
            string,
            T | Array<T>
            | Record<
                string,
                T | Array<T>
                | Record<
                    string,
                    T | Array<T>
                    | Record<
                        string,
                        T | Array<T>
                        | Record<
                            string,
                            T | Array<T>
                            | Record<
                                string,
                                T | Array<T>
                            >
                        >
                    >
                >
            >
        >


    type Log = RecordWithFiveObjectsNestedAndArraysDeepContainingType<string>

    type InferEntrySchema<T extends PropertyKey> = Record<
        T,
        string | number | boolean | null | undefined |
        RecordWithFiveObjectsNestedAndArraysDeepContainingType<string | number | boolean | null | undefined>
    >





    type ContentValue = {
        id: string;
        slug: string;
        body: string;
        collection: string;
        data: InferEntrySchema<string>
    } & { render(): Render[".md"] }


    type DataValue = {
        id: string;
        collection: string;
        data: InferEntrySchema<string>
    }

    type ContentEntryMap = Record<string, Record<string, ContentValue>>;

    type DataEntryMap = Record<string, Record<string, DataValue>>;

    type AnyEntryMap = ContentEntryMap & DataEntryMap;

    type ContentConfig = typeof import("../src/content/config");






}