import type { Node } from "packages/markdoc-html-tags/src/utils/markdoc";
import {
    createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue,
    generateMarkdocErrorObject,
    generateNonPrimarySchema,
    generateSelfClosingTagSchema,
} from "packages/markdoc-html-tags/src/utils";

export { abbr } from "./abbreviation"
export { a } from "./anchor"

export const sup = generateSelfClosingTagSchema({ render: "sup", validationType: String, }, {});
export const sub = generateSelfClosingTagSchema({ render: "sub", validationType: String, });
export const span = generateSelfClosingTagSchema({ render: "span", validationType: String });
export const cite = generateSelfClosingTagSchema({ render: "cite", validationType: String, });
export const code = generateSelfClosingTagSchema({ render: "code", validationType: String, });
export const dfn = generateSelfClosingTagSchema({ render: "dfn", validationType: String, });
export const samp = generateSelfClosingTagSchema({ render: "samp", validationType: String, });
export const time = generateSelfClosingTagSchema({ render: "time", validationType: String, });
export const mark = generateSelfClosingTagSchema({ render: "mark", validationType: String, });
export const q = generateSelfClosingTagSchema({ render: "q", validationType: String, });
export const kbd = generateSelfClosingTagSchema({ render: "kbd", validationType: String, });
export const bdo = generateSelfClosingTagSchema({ render: "bdo", validationType: String, });
export const data = generateSelfClosingTagSchema({ render: "data", validationType: String, });
export const dd = generateSelfClosingTagSchema({ render: "data", validationType: String, });
export const dt = generateSelfClosingTagSchema({ render: "data", validationType: String, });




export const header = generateNonPrimarySchema({
    render: "header",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    children: [
        "paragraph",
        "div",
        "inline",
    ]
})

export const footer = generateNonPrimarySchema({
    render: "footer",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    children: [
        "paragraph",
        "div",
        "inline",
    ]
})

export const main = generateNonPrimarySchema({
    render: "main",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    children: [
        "section",
        "paragraph",
        "div",
        "inline",
    ]
})


export const section = generateNonPrimarySchema({
    render: "section",
    attributes: {
        ariaLabelledBy: {
            type: String,
            required: false,

        },
        ariaLabel: {
            type: String,
            required: false,

        }
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
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        }
    },
});

export const details = generateNonPrimarySchema({
    render: "details",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },
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
export const picture = generateNonPrimarySchema({
    render: "picture",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },
    },
    children: [

        "image",
        "source",
    ]
})

export const figure = generateNonPrimarySchema({
    render: "figure",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },

    },
    children: [
        "header",
        "div",
        "figcaption",
        "footer",
        "image",
        "link",
    ]
});

export const figcaption = generateNonPrimarySchema({
    render: "figcaption",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    children: [
        "text",
        "inline"
    ]
});


export const colgroup = generateNonPrimarySchema({
    render: "colgroup",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },

    },
    children: [
        "col",
        "div",
    ]
});

export const col = generateNonPrimarySchema({
    render: "col",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },

    },
    children: [
        "inline",
        "text",
    ]
});
// TODO: Add proper attributes to the video schema.
export const video = generateNonPrimarySchema({
    render: "video",
    selfClosing: true,
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },

    },

});
// TODO: Add proper attributes to the audio schema.

export const audio = generateNonPrimarySchema({
    render: "audio",
    selfClosing: true,
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },

    },

});

export const div = generateNonPrimarySchema({
    render: "div",
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },

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
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        },
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

export const hr = generateNonPrimarySchema({
    render: "hr",
    selfClosing: true,
    attributes: {
        ariaHidden: {
            type: Boolean,
            required: false,
            default: false
        }
    }
});

