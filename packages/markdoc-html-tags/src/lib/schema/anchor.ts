import type { ValidationError } from "@markdoc/markdoc"
import {
    HttpURLOrPathAttribute,

    generateMarkdocErrorObject,
    getGenerateNonPrimarySchema,
} from "src/utils"



export class HrefAttribute extends HttpURLOrPathAttribute {



    override returnMarkdocErrorObjectOrNothing(value: string): ValidationError | void {



        const isAValidWordPath = /^\/.*\b\w+$/.test(value)

        const isValidMailtoString = /^mailto:([\w.-]+@[\w.-]+)(\?.+)?$/.test(value);

        const isValidTelString = /^tel:[\d-]+$/.test(value)

        const isValidWordThatStartsWithAHash = /^#(?<word>\b\w+)?$/.test(value)


        const theValueIsNotValid = ![
            this.relativeOrAbsolutePathRegex.test(value),
            this.httpUrlRegex.test(value),
            isAValidWordPath,
            isValidMailtoString,
            isValidTelString,
            isValidWordThatStartsWithAHash,
        ].some(Boolean)

        if (theValueIsNotValid) {

            return generateMarkdocErrorObject(
                "invalid-value",
                "error",
                `
          This value ${value} is not a valid href attribute.
          It must be one of these things.
          A word with a / or a # at the beginning of the string.
          A valid HTTP URL.
          A valid mailto string 
          A valid tel string. 
          A relative or absolute path.
          `
            )

        }

    }



}



export const a = getGenerateNonPrimarySchema({
    render: "a",
    attributes: {
        href: {
            type: HrefAttribute,
            required: true,
        },
        target: {
            type: String,
            errorLevel: "error",
            matches: [
                "_target",
                "_blank",
                "_parent",
                "_top",
            ]

        },
        referrerpolicy: {
            type: String,
            default: "no-referrer",
            matches: [
                "no-referrer",
                "no-referrer-when-downgrade",
                "origin",
                "origin-when-cross-origin",
                "same-origin",
                "strict-origin",
                "strict-origin-when-cross-origin",
                "unsafe-url",
            ]

        },
        download: {
            type: HttpURLOrPathAttribute,
            errorLevel: "error",
            description: "Allows the user to download a file from the computer or the project file system"
        }

    },
    children: [

        "span",
        "em",
        "strong",
        "abbr",
        "img",
    ]
})()
