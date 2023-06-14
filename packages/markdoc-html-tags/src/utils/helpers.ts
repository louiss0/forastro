import type { Schema, ValidationError, Scalar, RenderableTreeNode } from '@markdoc/markdoc';

import * as markdoc from '@markdoc/markdoc';

import type {
    SchemaAttributesWithAPrimaryKey,
    SchemaAttributesWithNoPrimaryKey,
    TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc
} from 'packages/markdoc-html-tags/src/lib/attributes';

import {
    data
} from 'packages/markdoc-html-tags/src/lib/attributes';


export class EnhancedTag extends markdoc.Tag {


    constructor (
        override readonly name: string,
        override readonly attributes: Record<string, Scalar>,
        override readonly children: Array<RenderableTreeNode>

    ) {
        super(name, attributes, children);

    }
};


type TagsSchema<T> = Omit<Schema, "attributes">
    & {
        render: string
        attributes: Partial<SchemaAttributesWithAPrimaryKey<T>>
    }

type SelfClosing = {
    selfClosing: true
    children?: never
}

type NonSelfClosing = {
    selfClosing?: never
    children: Exclude<Schema["children"], undefined>
}

type NonPrimaryTagsSchema<T> =
    & TagsSchema<T>
    & { attributes: Partial<SchemaAttributesWithNoPrimaryKey<T>> }



export const generatePrimarySchema = <T>(
    render: string,
    type: TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T>,
    config?: Omit<NonPrimaryTagsSchema<T>, "render">
) => {


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


type GenerateNonPrimarySchemaConfig<T> =
    (NonSelfClosing | SelfClosing)
    & Pick<NonPrimaryTagsSchema<T>, "attributes" | "render">

type GenerateNonSecondarySchemaConfig<T> =
    Pick<NonPrimaryTagsSchema<T>, "slots" | "transform" | "validate" | "description">

export const generateNonPrimarySchema = <T>
    (primaryConfig: GenerateNonPrimarySchemaConfig<T>, secondaryConfig: GenerateNonSecondarySchemaConfig<T> = {}) => {


    const {
        description = "This is a Schema without a primary tag"
    } = secondaryConfig

    return {
        ...primaryConfig,
        description,
        ...secondaryConfig,
    } satisfies TagsSchema<T>

};

export const generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes = <T>(
    primaryConfig: GenerateNonPrimarySchemaConfig<T> & {
        attributes: { data?: never } & Partial<SchemaAttributesWithNoPrimaryKey<T>>
    },
    secondaryConfig: Omit<GenerateNonSecondarySchemaConfig<T>, "transform"> = {}
) => {

    const { attributes, ...rest } = primaryConfig

    return generateNonPrimarySchema({
        attributes: {
            ...attributes,
            data
        },
        ...rest
    }, {
        ...secondaryConfig,
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

    })
}

export function generateSelfClosingTagSchema<T>(
    primaryConfig: Pick<NonPrimaryTagsSchema<T>, "render" | "transform"> & {
        validationType: TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T>
    },
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


    return conditionalErrors
        .reduce(
            (carry: Array<ValidationError>, [condition, error]) => condition ? carry.concat(error) : carry,
            []
        )


};


