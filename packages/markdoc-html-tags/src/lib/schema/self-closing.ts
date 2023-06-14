import { generateSelfClosingTagSchema } from "packages/markdoc-html-tags/src/utils";

export { abbr } from "./abbreviation"
export { a } from "./anchor"


export const sup = generateSelfClosingTagSchema({ render: "sup", validationType: String, },);
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



