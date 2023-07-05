
import * as markdoc from '@markdoc/markdoc';


import type {
    SchemaAttributesWithAPrimaryKey,
    SchemaAttributesWithNoPrimaryKey,
    ProperSchemaMatches,
    MarkdocAttributeSchema,
    RequiredSchemaAttributeType,
} from 'packages/markdoc-html-tags/src/lib/attributes';

import { toLowercaseWithDashes, type AllowedMarkdocTypesAsStrings, isViableMarkdocValue } from 'packages/markdoc-html-tags/src/utils/internal';





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


export const createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue = (
    ...conditionalErrors: Array<[condition: boolean, error: ReturnType<typeof generateMarkdocErrorObject>]>
) => conditionalErrors.reduce(
    (carry: Array<markdoc.ValidationError>, [condition, error]) => condition ? carry.concat(error) : carry,
    []
)




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
) => Object.freeze(location ? { id, level, message, location } : { id, level, message, }) satisfies markdoc.ValidationError




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


type GenerateNonPrimarySchemaConfigThatDoesNotAllowDataConfig<
    T extends ProperSchemaMatches,
    U extends RequiredSchemaAttributeType,
    R extends string
> = GenerateNonPrimarySchemaConfig<T, U, R> & {
    attributes: { data?: never } & Partial<SchemaAttributesWithNoPrimaryKey<T, U>>
}

type GenerateNonSecondarySchemaConfigThatDoesNotAllowTransformConfig<
    T extends ProperSchemaMatches,
    U extends RequiredSchemaAttributeType,
    R extends string
> = Omit<GenerateNonSecondarySchemaConfig<T, U, R>, "transform" | "validate">



export const generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes =
    <
        T extends ProperSchemaMatches,
        U extends RequiredSchemaAttributeType,
        V extends GenerateNonPrimarySchemaConfigThatDoesNotAllowDataConfig<T, U, R>,
        R extends string
    >
        (primaryConfig: V) => {


        const { attributes, render } = primaryConfig

        return <W extends GenerateNonSecondarySchemaConfigThatDoesNotAllowTransformConfig<T, U, R>>(secondaryConfig?: W) => {

            const primaryConfigWithDataAttributeInserted = Object.assign(
                primaryConfig,
                {
                    render,
                    attributes: {
                        ...attributes,
                    }
                })
            const generateNonPrimarySchema = getGenerateNonPrimarySchema(primaryConfigWithDataAttributeInserted)

            return generateNonPrimarySchema({

                validate(node, config) {

                    const attrs = node.transformAttributes(config)



                    if (!("data" in attrs)) return []

                    const keysWithNoNumberBooleanOrStringValues =
                        Object.entries(attrs["data"]).reduce(
                            (carry: Array<string>, [key, value]) =>
                                isViableMarkdocValue(value)
                                    ? carry.concat(key)
                                    : carry,
                            []
                        )


                    return createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue(
                        [
                            keysWithNoNumberBooleanOrStringValues.length !== 0,
                            generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(`
                                Data attribute values are only supposed to have strings numbers and booleans.
                                HTML can't parse those anything else.
                                Please fix the following keys ${keysWithNoNumberBooleanOrStringValues.join(",")}.  
                            `)
                        ]
                    )


                },
                transform(node, config) {

                    const { tag, attributes, } = node



                    let newAttributes = {}
                    if ("data" in attributes) {

                        const { data } = attributes

                        const arrayTuplesWithKeysThatHaveDataAsThePrefixForEachWordAndIsCamelCased =
                            Object.entries(data).map(
                                ([key, value]) => [`data-${toLowercaseWithDashes(key)}`, value]
                            )




                        newAttributes = {
                            ...Object.fromEntries(
                                arrayTuplesWithKeysThatHaveDataAsThePrefixForEachWordAndIsCamelCased
                            )
                        }


                        delete attributes["data"]
                    }



                    return new markdoc.Tag(tag, { ...attributes, ...newAttributes }, node.transformChildren(config))

                },
                ...secondaryConfig,

            })

        }


    }


