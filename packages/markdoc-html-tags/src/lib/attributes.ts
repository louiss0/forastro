import { SchemaAttribute, ValidationType } from "@markdoc/markdoc";


// type TypeAndRequiredObject = Pick<SchemaAttribute, "type" | "required">

type TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T> =
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

type ReturnTypeBasedOnConstructor<T> =
    T extends StringConstructor | "String" ? string :
    T extends NumberConstructor | "Number" ? number :
    T extends ArrayConstructor | "Array" ? Array<string> | Array<number> | Array<Record<string, unknown>> :
    T extends ObjectConstructor | "Object" ? Record<string, unknown> :
    T extends Array<ValidationType> ? ReturnTypeBasedOnConstructor<T[number]> : never

type MarkdocAttributeSchema<T extends Array<string | number> | RegExp,> = {
    type: TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T>
    default?: TypeIsAStringOrNumberReturnTheValuesIfRegexReturnStringElseNever<T>
    | ReturnTypeBasedOnConstructor<TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T>>
    matches?: T
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


const generateMarkdocAttributeSchema = <T extends Array<string | number> | RegExp,>(config: MarkdocAttributeSchema<T>) =>
    Object.freeze(config)



export const accesskey = generateMarkdocAttributeSchema({
    type: String,
    default: "bar",

})

export const autocapitalize = generateMarkdocAttributeSchema({

});
export const contextmenu = generateMarkdocAttributeSchema({

});
export const dir = generateMarkdocAttributeSchema({

});
export const draggable = generateMarkdocAttributeSchema({

});

