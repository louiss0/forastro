import type { Schema, SchemaAttribute, ValidationError } from '@markdoc/markdoc';


type TypeAndRequiredObject = Pick<SchemaAttribute, "type" | "required">

type MarkdocAttributeSchema<T extends Array<string | number>,> = SchemaAttribute &
    (TypeAndRequiredObject & {
        default?: unknown
        matches?: SchemaAttribute["matches"]
    }
        | TypeAndRequiredObject & {
            default?: T[number]
            matches: T
        })

type PrimaryMarkdocAttributeSchema<T extends Array<string | number>,> =
    MarkdocAttributeSchema<T> & { render?: true }

type SchemaAttributesWithAPrimaryKey<T extends Array<string | number>> = {
    primary: PrimaryMarkdocAttributeSchema<T>
    [key: string]: MarkdocAttributeSchema<T>
}

type TagsSchema<T extends Array<string | number>> = Schema
    & {
        render: string
        attributes: Partial<SchemaAttributesWithAPrimaryKey<T>>
    }

type SchemaAttributesWithNoPrimaryKey<T extends Array<string | number>> =
    { primary?: never }
    & Record<string, MarkdocAttributeSchema<T>>


/* TODO: Refactor the generatePrimarySchema to use two different options.
 * One for children or self closing tag the other for options that will sometimes apply
*/
type SelfClosing = {
    selfClosing: true
    children?: never
}

type NonSelfClosing = {
    selfClosing?: never
    children: Exclude<Schema["children"], undefined>
}

type NonPrimaryTagsSchema<T extends Array<string | number>> =
    (NonSelfClosing | SelfClosing)
    & TagsSchema<T>
    & { attributes: Partial<SchemaAttributesWithNoPrimaryKey<T>> }



export const generatePrimarySchema = <T extends Array<string | number>>(render: string,
    type: SchemaAttribute["type"],
    config?: Omit<NonPrimaryTagsSchema<T>, "render">) => {


    return {
        render,
        ...config,
        attributes: {
            primary: {
                type,
                render: true,
                required: true,
            },
            ...config?.attributes,
        }
    } satisfies TagsSchema<T>

}


export const generateNonPrimarySchema = <T extends Array<string | number>>(
    render: string,
    attributes: SchemaAttributesWithNoPrimaryKey<T>,
    config: Omit<NonPrimaryTagsSchema<T>, "render" | "attributes"> = {}) => {

    const {
        inline = false,
        children = [
            "paragraph",
            "hr",
            "br",
            "div",
            "span",],
        description = "THis is a Schema without a primary tag"
    } = config

    return {
        render,
        attributes,
        inline,
        children,
        description,
        ...config,
    } satisfies TagsSchema<T>

};


export function generateSelfClosingTagSchema<T extends Array<string | number>>
    (render: string, validationType: SchemaAttribute["type"], config?: Partial<Pick<NonPrimaryTagsSchema<T>, "attributes" | "transform" | "description" | "validate">>) {


    return generatePrimarySchema(
        render,
        validationType,
        config ? {
            ...config,
            attributes: {
                ...config.attributes
            },
            selfClosing: true,
            inline: true
        } : undefined)
}


export function generateMarkdocErrorObject(
    id: ValidationError["id"],
    level: ValidationError["level"],
    message: ValidationError["message"]
) {

    return Object.freeze({ id, level, message }) satisfies ValidationError
}

type AllowedMarkdocTypesAsStrings = "string" | "number" | "array" | "boolean" | "object"

export const generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight = (
    type: AllowedMarkdocTypesAsStrings, value: unknown) => {

    return typeof value === type ? null
        : generateMarkdocErrorObject(
            "invalid-type",
            "error",
            `The value ${JSON.stringify(value)} passed is not the right type is supposed to be a ${type}`
        )

};

