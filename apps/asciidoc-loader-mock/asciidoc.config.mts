import { AsciidocConfigObject } from "@forastro/asciidoc";

export default {
    attributes: {
        sourceHighlighter: "shiki",
        shikiTheme: {
            light: "github-light-default",
            dark: "github-dark-default"
        }

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