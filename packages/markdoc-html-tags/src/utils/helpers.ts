import type { Schema, ValidationError, Scalar, RenderableTreeNode, ConfigType } from '@markdoc/markdoc';

import * as markdoc from '@markdoc/markdoc';

import type {
    SchemaAttributesWithAPrimaryKey,
    SchemaAttributesWithNoPrimaryKey,
    ProperSchemaMatches,
    MarkdocAttributeSchema,
    RequiredSchemaAttributeType,
} from 'src/lib/attributes';

import {
    dataMarkdocAttributeSchema as data
} from 'src/lib/attributes';


export class EnhancedTag extends markdoc.Tag {


    constructor (
        override readonly name: string,
        override readonly attributes: Record<string, Scalar>,
        override readonly children: Array<RenderableTreeNode>

    ) {
        super(name, attributes, children);

    }
};


type TagsSchema<
    T extends ProperSchemaMatches,
    U extends RequiredSchemaAttributeType,
    R extends string,
    C extends ConfigType = ConfigType
> =
    Omit<Schema<C, R>, "attributes">
    & {
        attributes: Partial<SchemaAttributesWithAPrimaryKey<T, U>>
    }

type SelfClosing = {
    selfClosing: true
    children?: never
}

type NonSelfClosing = {
    selfClosing?: never
    children: Exclude<Schema["children"], undefined>
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


type GenerateNonPrimarySchemaConfig<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType, R extends string> =
    (NonSelfClosing | SelfClosing)
    & Pick<NonPrimaryTagsSchema<T, U, R>, "attributes" | "render" | "description">

type GenerateNonSecondarySchemaConfig<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType, R extends string> =
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
> = Omit<GenerateNonSecondarySchemaConfig<T, U, R>, "transform">

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
                structuredClone(primaryConfig),
                {
                    render,
                    attributes: {
                        ...attributes,
                        data
                    }
                })
            const generateNonPrimarySchema = getGenerateNonPrimarySchema(primaryConfigWithDataAttributeInserted)

            return generateNonPrimarySchema({
                transform(node, config) {

                    const { tag, attributes, } = node

                    if (!tag) {

                        throw new Error("There is no tag cannot render")
                    }

                    let newAttributes = {}
                    if ("data" in attributes) {

                        const { data } = attributes

                        newAttributes = { ...data }

                        delete attributes["data"]
                    }

                    Object.assign(newAttributes, attributes)

                    return new EnhancedTag(tag, newAttributes, node.transformChildren(config))

                },
                ...secondaryConfig,

            })

        }



    }

type GenerateSelfClosingTagSchemaPrimaryConfig<T extends RequiredSchemaAttributeType, R extends string> =
    Required<Pick<NonPrimaryTagsSchema<null, T, R>, "description" | "render"> & {
        validationType: MarkdocAttributeSchema<null, T>["type"]
    }>
type GenerateSelfClosingTagSchemaSecondaryConfig<T extends RequiredSchemaAttributeType, R extends string> =
    Partial<Pick<NonPrimaryTagsSchema<null, T, R>, "attributes" | "transform">>


export function generateSelfClosingTagSchema
    <T extends RequiredSchemaAttributeType, R extends string>
    (
        primaryConfig: GenerateSelfClosingTagSchemaPrimaryConfig<T, R>,
        secondaryConfig: GenerateSelfClosingTagSchemaSecondaryConfig<T, R> = {}
    ) {

    const { render, validationType, description } = primaryConfig

    const { attributes, transform } = secondaryConfig


    const generatePrimarySchema = getGeneratePrimarySchema<null, T, R>(render, validationType)


    return generatePrimarySchema({
        description,
        attributes: {
            ...attributes
        },
        transform,
        selfClosing: true,
        inline: true
    })
}


export const generateMarkdocErrorObject = (
    id: ValidationError["id"],
    level: ValidationError["level"],
    message: ValidationError["message"]
) => Object.freeze({ id, level, message }) satisfies ValidationError


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


    return conditionalErrors
        .reduce(
            (carry: Array<ValidationError>, [condition, error]) => condition ? carry.concat(error) : carry,
            []
        )
};


