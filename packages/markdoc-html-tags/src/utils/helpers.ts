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



type SelfClosing = {
    selfClosing: true
    children?: never
}

type NonSelfClosing = {
    selfClosing?: never
    children: Exclude<Schema["children"], undefined>
}

type NonPrimaryTagsSchema<T extends Array<string | number>> =
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


type GenerateNonPrimarySchemaConfig<T extends Array<string | number>> =
    (NonSelfClosing | SelfClosing)
    & Pick<NonPrimaryTagsSchema<T>, "attributes" | "render">

type GenerateNonSecondarySchemaConfig<T extends Array<string | number>> =
    Pick<NonPrimaryTagsSchema<T>, "slots" | "transform" | "validate" | "description">

export const generateNonPrimarySchema = <T extends Array<string | number>>(
    primaryConfig: GenerateNonPrimarySchemaConfig<T>,
    secondaryConfig: GenerateNonSecondarySchemaConfig<T> = {}
) => {


    const {
        description = "This is a Schema without a primary tag"
    } = secondaryConfig

    return {
        ...primaryConfig,
        description,
        ...secondaryConfig,
    } satisfies TagsSchema<T>

};


export function generateSelfClosingTagSchema<T extends Array<string | number>>(
    primaryConfig: Pick<NonPrimaryTagsSchema<T>, "render" | "transform"> & { validationType: SchemaAttribute["type"] },
    config?: Partial<Pick<NonPrimaryTagsSchema<T>, "attributes" | "description" | "validate">>) {


    return generatePrimarySchema(
        primaryConfig.render,
        primaryConfig.validationType,
        config ? {
            ...config,
            attributes: {
                ...config.attributes
            },
            transform: primaryConfig?.transform,
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


export const generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight =
    (type: AllowedMarkdocTypesAsStrings, value: unknown) =>
        generateMarkdocErrorObject(
            "invalid-type",
            "error",
            `The value ${JSON.stringify(value)} passed is not the right type is supposed to be a ${type}`
        )

export const createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue = (
    conditionalErrors: Array<[condition: boolean, error: ReturnType<typeof generateMarkdocErrorObject>]>
) => {


    return conditionalErrors.reduce(
        (carry: Array<ValidationError>, [condition, error]) => condition ? carry.concat(error) : carry,
        [])


};


