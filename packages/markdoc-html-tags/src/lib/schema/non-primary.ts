import * as markdoc from "@markdoc/markdoc";
import {
    HttpURLOrPathAttribute,
    createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue,
    generateMarkdocErrorObject,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight,
    getGenerateNonPrimarySchema,
} from "src/utils";

import type {
    GenerateNonPrimarySchemaConfig,
    GenerateNonSecondarySchemaConfig,
} from "src/utils";

import { MarkdocAttributeSchemas } from "src/lib/attributes";


const {
    contenteditable,
    draggable,
    lang,
    title,
    translate,
    spellcheck,
    dir,
    ariaHidden,
    ariaLabel,
    cite,
    data,
    width,
    height } = MarkdocAttributeSchemas

import type {
    ProperSchemaMatches,
    RequiredSchemaAttributeType,
    SchemaAttributesWithNoPrimaryKey
} from "src/lib/attributes";



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


function toLowercaseWithDashes(str: string) {
    return str.replace(/(?<uppercased_letter>[A-Z])/g, function (_, p1: Record<"uppercased_letter", string>) {
        return '-' + p1.uppercased_letter.toLowerCase();
    }).toLowerCase();
}



const generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes =
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
                        data
                    }
                })
            const generateNonPrimarySchema = getGenerateNonPrimarySchema(primaryConfigWithDataAttributeInserted)

            return generateNonPrimarySchema({

                validate(node) {

                    const attrs = node.attributes as Record<"data", Record<string, unknown>>



                    const keysWithNoNumberBooleanOrStringValues =
                        Object.entries(attrs).reduce(
                            (carry: Array<string>, [key, value]) =>
                                typeof value !== "string"
                                    || typeof value !== "number"
                                    || typeof value !== "boolean"
                                    ?
                                    carry.concat(key)
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


class IframeSrcAttribute extends HttpURLOrPathAttribute {

    returnMarkdocErrorObjectOrNothing(value: unknown): void | markdoc.ValidationError {




        return value !== "string"
            ? generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight("string")
            : !this.httpUrlRegex.test(value)
                ? generateMarkdocErrorObject(
                    "invalid-attribute",
                    "error",
                    `The string ${value} must be a valid HTTP URL`
                )
                : undefined



    }
}

export const iframe = getGenerateNonPrimarySchema({
    render: "iframe",
    selfClosing: true,
    attributes: {
        title: {
            type: String,
            required: true,
            description: "The word used to describe the content of the iframe",
        },
        allow: {
            type: String,
            matches: /\b\w+(?:\s\w+)*\b/
        },
        name: {
            type: String,
            description: "The name of the iframe",
        },
        loading: {
            type: String,
            matches: [
                "eager",
                "lazy",
            ]
        },
        allowfullscreen: {
            type: Boolean,
            description: "It allows the iframe to go fullscreen"
        },
        refferpolicy: {
            type: String,
            matches: [
                "no-referrer",
                "no-referrer-when-downgrade",
                "origin",
                "origin-when-cross-origin",
                "same-origin",
                "strict-origin-when-cross-origin",
                "unsafe-url",
            ]
        },
        sandbox: {
            type: String,
            matches: [
                "allow-forms",
                "allow-pointer-lock",
                "allow-popups",
                "allow-same-origin",
                "allow-scripts",
                "allow-top-navigation,"
            ]
        },
        allowpaymentrequest: {
            type: Boolean,
            description: "It allows the iframe to invoke the Payment Request API"
        },
        src: {
            type: IframeSrcAttribute,
            required: true,
            description: "This attribute is the path to the place containing media to display"
        },
        ariaHidden,
        width,
        height,
    },
})();

export const hr = getGenerateNonPrimarySchema({
    render: "hr",
    selfClosing: true,
    attributes: { ariaHidden }
})();

export const br = getGenerateNonPrimarySchema({
    render: "br",
    selfClosing: true,
    attributes: { ariaHidden },
})();


export const blockquote = getGenerateNonPrimarySchema({
    render: "blockquote",
    selfClosing: true,
    attributes: {
        cite
    }
})();

export const details = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "details",
    attributes: {
        ariaHidden,
        open: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    children: [
        "summary"
    ]
})();

export const picture = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "picture",
    attributes: { ariaHidden, },
    children: [
        "image",
        "source",
    ]
})()

export const dl = getGenerateNonPrimarySchema({
    render: "dl",
    attributes: {
        ariaLabel
    },
    children: [
        "dt",
        "dd",
    ]
})()

export const figure = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "figure",
    attributes: {
        ariaHidden,
        ariaLabel
    },
    children: [
        "header",

        "figcaption",
        "paragraph",
        "footer",
        "image",
        "audio",
        "picture",
        "video",
        "link",
    ]
})();

export const figcaption = getGenerateNonPrimarySchema({
    render: "figcaption",
    attributes: { ariaHidden },
    children: [
        "text",
        "inline"
    ]
})();


export const colgroup = getGenerateNonPrimarySchema({
    render: "colgroup",
    attributes: { ariaHidden, },
    children: [
        "col",

        "text",
    ]
})();

export const col = getGenerateNonPrimarySchema({
    render: "col",
    attributes: { ariaHidden, },
    children: [
        "inline",
        "text",
    ]
})();
// TODO: Add proper attributes to the video schema.

/** 
 * This is an attribute that is experimental 
 * const disableremoteplayback = generateAttributeSchema{
            type: Boolean,
            description: "A Boolean attribute used to disable the capability of remote playback in devices that are attached using wired and wireless technologies"
    }),
*/

export const video = getGenerateNonPrimarySchema({
    render: "video",
    selfClosing: true,
    attributes: {
        ariaHidden,
        src: {
            type: String,
            required: true,
            description: "This is the link to the audio file you want to use"
        },
        type: {
            type: String,
            description: "The acceptable media types only for video",
            matches: /^video\/[a-z]+$/
        },
        autoPlay: {
            type: Boolean,
            description: "A Boolean attribute: if specified, the audio will automatically begin playback as soon as it can do so"
        },
        controls: {
            type: Boolean,
            description: "A Boolean attribute: if specified, the user can control the audio of the "
        },
        controlslist: {
            type: String,
            matches: [
                "nodownload",
                "nofullscreen",
                "noremoteplayback"
            ],
            description: "A String attribute: if specified, helps the browser select what controls to show for the audio element whenever the browser shows its own set of controls (that is, when the controls attribute is specified)."
        },
        crossorigin: {
            type: String,
            matches: [
                "anonymous",
                "use-credentials",
            ],
        },

        loop: {
            type: Boolean,
            description: "A Boolean attribute: if specified, the audio player will automatically seek back to the start upon reaching the end of the audio."
        },
        muted: {
            type: Boolean,
            default: false,
            description: "A Boolean attribute that indicates whether the audio will be initially silenced.Its default value is false."
        },
        preload: {
            type: String,
            description: "This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience.",
            matches: [
                "none",
                "metadata",
                "audio",
            ]
        },
        playsinline: {
            type: Boolean,
            description: "A Boolean attribute indicating that the video is to be played 'inline', that is within the element's playback area. Note that the absence of this attribute does not imply that the video will always be played in fullscreen."
        },
        poster: {
            type: String,
            description: "A URL for an image to be shown while the video is downloading. If this attribute isn't specified, nothing is displayed until the first frame is available, then the first frame is shown as the poster frame."
        }

    },
})();

export const audio = getGenerateNonPrimarySchema({
    render: "audio",
    selfClosing: true,
    attributes: {
        src: {
            type: String,
            required: true,
            description: "This is the link to the audio file you want to use"
        },
        type: {
            type: String,
            description: "The acceptable media types only for audio",
            matches: /^audio\/[a-z]+$/
        },
        ariaHidden,
        autoPlay: {
            type: Boolean,
            description: "A Boolean attribute: if specified, the audio will automatically begin playback as soon as it can do so"
        },
        controls: {
            type: Boolean,
            description: "A Boolean attribute: if specified, the user can control the audio of the "
        },
        controlsList: {
            type: String,
            matches: [
                "nodownload",
                "nofullscreen",
                "noremoteplayback"
            ],
            description: "A String attribute: if specified, helps the browser select what controls to show for the audio element whenever the browser shows its own set of controls (that is, when the controls attribute is specified)."
        },
        crossorigin: {
            type: String,
            matches: [
                "anonymous",
                "use-credentials",
            ],
        },
        disableremoteplayback: {
            type: Boolean,
            description: "A Boolean attribute used to disable the capability of remote playback in devices that are attached using wired and wireless technologies"
        },
        loop: {
            type: Boolean,
            description: "A Boolean attribute: if specified, the audio player will automatically seek back to the start upon reaching the end of the audio."
        },
        muted: {
            type: Boolean,
            default: false,
            description: "A Boolean attribute that indicates whether the audio will be initially silenced.Its default value is false."
        },
        preload: {
            type: String,
            description: "This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience.",
            matches: [
                "none",
                "metadata",
                "audio",
            ]
        }

    },
})();



export const paragraph = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "paragraph",
    attributes: {
        contenteditable,
        draggable,
        title,
        lang,
        spellcheck,
        dir,
        translate,
    },
    children: [
        "inline",
        "text",
        "link",
    ]
})();




export const summary = getGenerateNonPrimarySchema({
    render: "summary",
    attributes: { ariaHidden },
    children: [
        "inline",
        "div"
    ]
})();

