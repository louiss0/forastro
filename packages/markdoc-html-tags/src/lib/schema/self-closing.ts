import { generateSelfClosingTagSchema } from "packages/markdoc-html-tags/src/utils";

export { abbr } from "./abbreviation"
export { a } from "./anchor"


export const sup = generateSelfClosingTagSchema({
    render: "sup",
    validationType: String,
    description: "A schema  for creating a sup element"
},);

export const sub = generateSelfClosingTagSchema({
    render: "sub",
    validationType: String,
    description: "A schema  for creating a sub element"
});

export const span = generateSelfClosingTagSchema({
    render: "span",
    validationType: String,
    description: "A schema  for creating a span element"
});

export const cite = generateSelfClosingTagSchema({
    render: "cite",
    validationType: String,
    description: "A schema  for creating a cite element"
});
export const code = generateSelfClosingTagSchema({
    render: "code",
    validationType: String,
    description: "A schema  for creating a code element"
});
export const dfn = generateSelfClosingTagSchema({
    render: "dfn",
    validationType: String,
    description: "A schema  for creating a dfn element"
});
export const samp = generateSelfClosingTagSchema({
    render: "samp",
    validationType: String,
    description: "A schema  for creating a samp element"
});
export const time = generateSelfClosingTagSchema({
    render: "time",
    validationType: String,
    description: "A schema  for creating a time element"
});
export const mark = generateSelfClosingTagSchema({
    render: "mark",
    validationType: String,
    description: "A schema  for creating a mark element"
});
export const q = generateSelfClosingTagSchema({
    render: "q",
    validationType: String,
    description: "A schema  for creating a mark element"
});
export const kbd = generateSelfClosingTagSchema({
    render: "kbd",
    validationType: String,
    description: "A schema  for creating a sup element"
});
export const bdo = generateSelfClosingTagSchema({
    render: "bdo",
    validationType: String,
    description: "A schema  for creating a sup element"
});

export const data = generateSelfClosingTagSchema({
    render: "data",
    validationType: String,
    description: "A schema  for creating a data element"
});

export const dd = generateSelfClosingTagSchema({
    render: "data",
    validationType: String,
    description: "A schema  for creating a dd element"
});

export const dt = generateSelfClosingTagSchema({
    render: "data",
    validationType: String,
    description: "A schema  for creating a dt element",
});



