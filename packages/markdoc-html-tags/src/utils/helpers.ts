

import * as markdoc from '@markdoc/markdoc';


import type {
    SchemaAttributesWithAPrimaryKey,
    SchemaAttributesWithNoPrimaryKey,
    ProperSchemaMatches,
    MarkdocAttributeSchema,
    RequiredSchemaAttributeType,
} from 'src/lib/attributes';




type TagsSchema<
    T extends ProperSchemaMatches,
    U extends RequiredSchemaAttributeType,
    R extends string,
    C extends markdoc.ConfigType = markdoc.ConfigType
> =
    Omit<markdoc.Schema<C, R>, "attributes">
    & {
        attributes: Partial<SchemaAttributesWithAPrimaryKey<T, U>>
    }

type SelfClosing = {
    selfClosing: true
    children?: never
}

type NonSelfClosing = {
    selfClosing?: never
    children: Exclude<markdoc.Schema["children"], undefined>
}

type NonPrimaryTagsSchema<
    T extends ProperSchemaMatches,
    U extends RequiredSchemaAttributeType,
    R extends string> =
    & TagsSchema<T, U, R>
    & { attributes: Partial<SchemaAttributesWithNoPrimaryKey<T, U>> }



export const getGeneratePrimarySchema = <
    T extends ProperSchemaMatches,
    U extends RequiredSchemaAttributeType,
    R extends string
>
    (render: R, type: MarkdocAttributeSchema<T, U>["type"],) => {

    const generatePrimarySchema =
        <V extends Omit<NonPrimaryTagsSchema<T, U, R>, "render">>
            ({ attributes, ...rest }: V) => Object.freeze({
                render,
                attributes: {
                    primary: {
                        type,
                        render: true,
                        required: true,
                    },
                    ...attributes,
                },
                ...rest,
            }) satisfies TagsSchema<T, U, R>

    return generatePrimarySchema

}


export type GenerateNonPrimarySchemaConfig<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType, R extends string> =
    (NonSelfClosing | SelfClosing)
    & Pick<NonPrimaryTagsSchema<T, U, R>, "attributes" | "render" | "description">

export type GenerateNonSecondarySchemaConfig<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType, R extends string> =
    Pick<NonPrimaryTagsSchema<T, U, R>, "slots" | "transform" | "validate">

export const getGenerateNonPrimarySchema = <
    T extends ProperSchemaMatches,
    U extends RequiredSchemaAttributeType,
    V extends GenerateNonPrimarySchemaConfig<T, U, R>,
    R extends string,
>
    (primaryConfig: V) => {


    const generateNonPrimarySchema = <
        W extends GenerateNonSecondarySchemaConfig<T, U, R>
    >
        (secondaryConfig?: W) => Object.freeze(
            secondaryConfig
                ? {
                    ...primaryConfig,
                    ...secondaryConfig,
                }
                : primaryConfig
        ) satisfies NonPrimaryTagsSchema<T, U, R>

    return generateNonPrimarySchema

}




type GenerateSelfClosingTagSchemaPrimaryConfig<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType, R extends string> =
    Required<Pick<NonPrimaryTagsSchema<T, U, R>, "description" | "render"> & {
        validationType: MarkdocAttributeSchema<T, U>["type"]
    }>
type GenerateSelfClosingTagSchemaSecondaryConfig<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType, R extends string> =
    Partial<Pick<NonPrimaryTagsSchema<T, U, R>, "attributes" | "transform" | "inline">>


export function generateSelfClosingTagSchema
    <T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType, R extends string>
    (
        primaryConfig: GenerateSelfClosingTagSchemaPrimaryConfig<T, U, R>,
        secondaryConfig: GenerateSelfClosingTagSchemaSecondaryConfig<T, U, R> = {}
    ) {

    const { render, validationType, description } = primaryConfig

    const { attributes, transform, inline = true } = secondaryConfig


    const generatePrimarySchema = getGeneratePrimarySchema<T, U, R>(render, validationType)


    return generatePrimarySchema({
        description,
        attributes: {
            ...attributes
        },
        transform,
        selfClosing: true,
        inline
    })
}




export const generateMarkdocErrorObject = (
    id: markdoc.ValidationError["id"],
    level: markdoc.ValidationError["level"],
    message: markdoc.ValidationError["message"],
    location?: markdoc.ValidationError["location"]
) => Object.freeze({ id, level, message, location }) satisfies markdoc.ValidationError


type AllowedMarkdocTypesAsStrings = "string" | "number" | "array" | "boolean" | "object"


export const generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight =
    (type: AllowedMarkdocTypesAsStrings) => generateMarkdocErrorObject(
        "invalid-type",
        "error",
        `The value passed is not the right type is supposed to be a ${type}`
    )

export const generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight =
    (message: string) => generateMarkdocErrorObject(
        "invalid-value",
        "error",
        message
    )


export const createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue = (
    ...conditionalErrors: Array<[condition: boolean, error: ReturnType<typeof generateMarkdocErrorObject>]>
) => conditionalErrors.reduce(
    (carry: Array<markdoc.ValidationError>, [condition, error]) => condition ? carry.concat(error) : carry,
    []
)



