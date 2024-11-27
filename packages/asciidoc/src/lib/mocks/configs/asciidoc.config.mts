import { type AsciidocConfigObject } from "../../internal"

export default {
    attributes: {

        author: "Shelton Louis"
    },

    blocks: {
        shout: {
            context: "literal",
            processor: (content) => `SHOUT:\n${content}`
        }
    },
    macros: {
        inline: {
            info: {
                context: "anchor",
                processor: (target) => `Info ${target}`
            }
        }
    }


} satisfies AsciidocConfigObject