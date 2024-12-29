import { AsciidocConfigObject } from "@forastro/asciidoc";

export default {
    attributes: {
        sourceHighlighter: "shiki",
        shikiTheme: {
            light: "github-light",
            dark: "github-dark"
        }
    }

} satisfies AsciidocConfigObject