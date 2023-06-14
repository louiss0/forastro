import {
    createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue,
    generateMarkdocErrorObject,
    generateNonPrimarySchema,
    generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes,
} from "packages/markdoc-html-tags/src/utils";
import {
    contenteditable, draggable, lang, title, translate, spellcheck, dir,
    ariaHidden, ariaLabel, ariaLabelledBy
} from "packages/markdoc-html-tags/src/lib/attributes";
import { Node } from "@markdoc/markdoc";

export const header = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "header",
    attributes: {
        ariaHidden,

    },
    children: [
        "paragraph",
        "div",
        "inline",
    ]
})

export const footer = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "footer",
    attributes: {
        ariaHidden,

    },
    children: [
        "paragraph",
        "div",
        "inline",
    ]
})

export const main = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "main",
    attributes: {
        ariaHidden,
    },
    children: [
        "section",
        "paragraph",
        "div",
        "inline",
    ]
})


export const section = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "section",
    attributes: {
        ariaHidden,
        ariaLabel,
        ariaLabelledBy,
    },
    children: [
        "heading",
        "paragraph",
        "div",
        "inline",
    ]

}, {
    validate(node: Node) {

        const { attributes } = node

        const firstChild = node.children[0]

        const ariaLabelledByInAttributes = "ariaLabelledBy" in attributes
        const ariaLabelInAttributes = "ariaLabel" in attributes
        const theFirstSchemaIsAHeading = firstChild.tag !== "heading"

        return createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue(
            [
                [
                    ariaLabelledByInAttributes && ariaLabelInAttributes,
                    generateMarkdocErrorObject(
                        "invalid-attributes",
                        "error",
                        `You can't have both an id and an aria label and id in a section.
                    A section with an ariaLabel is one without a heading 
                    A section with an id is one that has a h2 as one of it's id's 
                    `
                    )
                ],
                [
                    ariaLabelledByInAttributes && theFirstSchemaIsAHeading,
                    generateMarkdocErrorObject(
                        "wrong-structure",
                        "critical",
                        `When you have a section with a ariaLabelledBy attribute, 
                     you are also supposed to have the firstChild be a heading 2
                     with and id that has the same value as the ariaLabelledBy
                     attribute.  
                    `
                    )
                ],
                [
                    ariaLabelledByInAttributes && theFirstSchemaIsAHeading

                    && "level" in firstChild.attributes && firstChild.attributes["level"] !== 2

                    && "id" in firstChild.attributes && attributes["ariaLabelledBy"] !== firstChild.attributes["id"],

                    generateMarkdocErrorObject(
                        "invalid-children",
                        "critical",
                        `The first child of a section with an ariaLabelledBy attribute
                        is supposed to a heading with a level of 2 not ${firstChild.attributes["level"]}
                    
                    `
                    )
                ]
            ]
        )

    },
})



export const br = generateNonPrimarySchema({
    render: "br",
    selfClosing: true,
    attributes: { ariaHidden },
});

export const hr = generateNonPrimarySchema({
    render: "hr",
    selfClosing: true,
    attributes: {
        ariaHidden
    }
});

export const details = generateNonPrimarySchema({
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
});

// TODO: Add proper attributes to the picture schema.
export const picture = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "picture",
    attributes: {
        ariaHidden,
    },
    children: [
        "image",
        "source",
    ]
})

export const figure = generateNonPrimarySchema({
    render: "figure",
    attributes: {
        ariaHidden,
        ariaLabel
    },
    children: [
        "header",
        "div",
        "figcaption",
        "footer",
        "image",
        "audio",
        "picture",
        "video",
        "link",
    ]
});

export const figcaption = generateNonPrimarySchema({
    render: "figcaption",
    attributes: {
        ariaHidden
    },
    children: [
        "text",
        "inline"
    ]
});


export const colgroup = generateNonPrimarySchema({
    render: "colgroup",
    attributes: {
        ariaHidden,

    },
    children: [
        "col",
        "div",
    ]
});

export const col = generateNonPrimarySchema({
    render: "col",
    attributes: {
        ariaHidden,

    },
    children: [
        "inline",
        "text",
    ]
});
// TODO: Add proper attributes to the video schema.

/** 
 * This is an attribute that is experimental 
 * const disableremoteplayback = generateAttributeSchema{
            type: Boolean,
            description: "A Boolean attribute used to disable the capability of remote playback in devices that are attached using wired and wireless technologies"
    }),
*/

export const video = generateNonPrimarySchema({
    render: "video",
    selfClosing: true,
    attributes: {
        ariaHidden,
        src: {
            type: String,
            required: true,
            description: "This is the link to the audio file you want to use"
        },
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
});

export const audio = generateNonPrimarySchema({
    render: "audio",
    selfClosing: true,
    attributes: {
        src: {
            type: String,
            required: true,
            description: "This is the link to the audio file you want to use"
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
});

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
});


export const div = generateNonPrimarySchemaWithATransformThatGeneratesDataAttributes({
    render: "div",
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
        "paragraph",
        "text",
        "image",
        "link",
    ]
});

export const hgroup = generateNonPrimarySchema({
    render: "hgroup",
    attributes: {
        ariaHidden,
        draggable,
    },
    children: [
        "heading",
        "paragraph"
    ]
})


export const summary = generateNonPrimarySchema({
    render: "summary",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    children: [
        "inline",
        "div"
    ]
});



