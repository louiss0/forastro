import { glob } from "fast-glob"


export async function getAsciidocPaths(folderName: string) {

    return await glob(`**/*.{adoc,asciidoc}`, {
        cwd: folderName,
        absolute: true
    })
}
