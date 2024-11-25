import { glob } from "fast-glob"


export async function getAsciidocPaths() {



    return await glob("**/*.{adoc,asciidoc}",)
}
