import { AsciidocConfigObject } from "@forastro/asciidoc";

export default {
    attributes: {
        sourceHighlighter: "highlight.js",

    },
    macros: {
        block: {
            shout: {
                context: "pass",
                render: (content) => `Shout: ${content}`
            },

        }
    }

} satisfies AsciidocConfigObject