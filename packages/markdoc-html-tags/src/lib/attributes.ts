import { SchemaAttribute } from "@markdoc/markdoc";


// type TypeAndRequiredObject = Pick<SchemaAttribute, "type" | "required">

type TypeIsAStringOrNumberReturnStringORNumberConstructorElseReturnMarkdoc<T> =
    T extends Array<string> | RegExp
    ? StringConstructor
    : T extends Array<number>
    ? NumberConstructor
    : SchemaAttribute["type"]

type TypeIsAStringOrNumberReturnTheValuesIfRegexReturnStringElseNever<T> =
    T extends Array<string> | Array<number>
    ? T[number]
    : T extends RegExp
    ? string
    : never

type MarkdocAttributeSchema<T extends Array<string | number> | RegExp,> = {
    type: TypeIsAStringOrNumberReturnStringORNumberConstructorElseReturnMarkdoc<T>
    default?: TypeIsAStringOrNumberReturnTheValuesIfRegexReturnStringElseNever<T>
    matches: T
} & Omit<SchemaAttribute, "matches" | "default" | "type">


export type PrimaryMarkdocAttributeSchema<T extends Array<string | number>,> =
    MarkdocAttributeSchema<T> & { render?: true }

export type SchemaAttributesWithAPrimaryKey<T extends Array<string | number>> = {
    primary: PrimaryMarkdocAttributeSchema<T>
    [key: string]: MarkdocAttributeSchema<T>
}

export type SchemaAttributesWithNoPrimaryKey<T extends Array<string | number>> =
    { primary?: never }
    & Record<string, MarkdocAttributeSchema<T>>


const generateMarkdocAttributeSchema = <T extends Array<string | number> | RegExp,>(config: MarkdocAttributeSchema<T>) => config




export const accesskey = generateMarkdocAttributeSchema({
    type: String,
    default: "bar",
    matches: [
        "foo",
        "bar"
    ]
})

export const autocapitalize = generateMarkdocAttributeSchema({

});
export const contextmenu = generateMarkdocAttributeSchema({

});
export const dir = generateMarkdocAttributeSchema({

});
export const draggable = generateMarkdocAttributeSchema({

});

