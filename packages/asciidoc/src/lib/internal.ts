import { glob } from "fast-glob"


export async function getAsciidocPaths(folderName: string) {

    if (folderName === "") {


        throw Error("Don't pass in an empty string pass in a value with slashes instead")

    }



    return await glob(`**/*.{adoc,asciidoc}`, {
        cwd: folderName,
        absolute: true
    })
}

