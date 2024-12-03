import { type AsciidocConfigObject } from "../../asciidoc"

export default {
    attributes: {

        author: "Shelton Louis"
    },

    blocks: {
        shout: {
            context: "literal",
            render: (content) => `SHOUT:\n${content}`
        }
    },
    macros: {
        inline: {
            info: {
                context: "anchor",
                render: (target) => `Info ${target}`
            }
        },
        block: {
            message: {
                context: 'literal',
                render: (target) => `MESSAGE: ${target}`
            }
        }
    }


} satisfies AsciidocConfigObject
