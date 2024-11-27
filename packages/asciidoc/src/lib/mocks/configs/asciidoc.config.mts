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



    }

} satisfies AsciidocConfigObject