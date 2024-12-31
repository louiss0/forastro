import { AsciidocConfigObject } from "@forastro/asciidoc";

export default {
    attributes: {
        sourceHighlighter: "prism",


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