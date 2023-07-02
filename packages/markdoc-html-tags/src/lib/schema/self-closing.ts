import { generateSelfClosingTagSchema } from "packages/markdoc-html-tags/src/utils";

export { abbr } from "packages/markdoc-html-tags/src/lib/schema/abbreviation"
import { MarkdocAttributeSchemas, type ProperSchemaMatches, type RequiredSchemaAttributeType } from "packages/markdoc-html-tags/src/lib/attributes"
export { a } from "packages/markdoc-html-tags/src/lib/schema/anchor"




export const sup = generateSelfClosingTagSchema({
    render: "sup",
    validationType: String,
    description: "A schema for creating a sup element"
});

export const figcaption = generateSelfClosingTagSchema({
    render: "figcaption",
    validationType: String,
    description: "This is the description of a figure"
}, { inline: false, });


export const del = generateSelfClosingTagSchema<ProperSchemaMatches, RequiredSchemaAttributeType, "del">({
    render: "del",
    validationType: String,
    description: "A schema for creating a sup element"
}, {
    attributes: {
        cite: MarkdocAttributeSchemas.cite,
        datetime: MarkdocAttributeSchemas.datetime
    }
});
export const ins = generateSelfClosingTagSchema<ProperSchemaMatches, RequiredSchemaAttributeType, "ins">({
    render: "ins",
    validationType: String,
    description: "A schema for creating a sup element"
}, {
    attributes: {
        cite: MarkdocAttributeSchemas.cite,
        datetime: MarkdocAttributeSchemas.datetime

    }
});


export const sub = generateSelfClosingTagSchema({
    render: "sub",
    validationType: String,
    description: "A schema for creating a sub element"
});

export const span = generateSelfClosingTagSchema({
    render: "span",
    validationType: String,
    description: "A schema for creating a span element"
}, { inline: false });

export const cite = generateSelfClosingTagSchema({
    render: "cite",
    validationType: String,
    description: "A schema for creating a cite element"
});
export const code = generateSelfClosingTagSchema({
    render: "code",
    validationType: String,
    description: "A schema for creating a code element"
});

export const dfn = generateSelfClosingTagSchema({
    render: "dfn",
    validationType: String,
    description: "A schema for creating a dfn element"
}, { inline: false });

export const samp = generateSelfClosingTagSchema({
    render: "samp",
    validationType: String,
    description: "A schema for creating a samp element"
});

export const time = generateSelfClosingTagSchema<ProperSchemaMatches, RequiredSchemaAttributeType, "time">({
    render: "time",
    validationType: String,
    description: "A schema for creating a time element"
}, {
    inline: false,
    attributes: {
        datetime: {
            ...MarkdocAttributeSchemas.datetime,
            required: true
        }
    }
});

export const mark = generateSelfClosingTagSchema({
    render: "mark",
    validationType: String,
    description: "A schema for creating a mark element"
});
export const q = generateSelfClosingTagSchema({
    render: "q",
    validationType: String,
    description: "A schema for creating a mark element"
});
export const kbd = generateSelfClosingTagSchema({
    render: "kbd",
    validationType: String,
    description: "A schema for creating a sup element"
});
export const bdo = generateSelfClosingTagSchema({
    render: "bdo",
    validationType: String,
    description: "A schema for creating a sup element"
});

export const data = generateSelfClosingTagSchema({
    render: "data",
    validationType: String,
    description: "A schema for creating a data element"
});

export const dd = generateSelfClosingTagSchema({
    render: "dd",
    validationType: String,
    description: "A schema for creating a dd element"
}, { inline: false });

export const dt = generateSelfClosingTagSchema({
    render: "dt",
    validationType: String,
    description: "A schema for creating a dt element",
}, { inline: false });



