import type { ValidationError } from "@markdoc/markdoc"
import {
    MarkdocValidatorAttribute,
    generateMarkdocErrorObject,
    getGenerateNonPrimarySchema,
} from "src/utils"


const relativeOrAbsolutePathRegex =
    /^(\/|\.?\.?\/)\S+(\/[A-Za-z0-9-_\s]+\.[a-z0-9]+|\/[A-Za-z0-9-_\s]+)/

export class AnchorAttribute extends MarkdocValidatorAttribute {

    override returnMarkdocErrorObjectOrNothing(value: string): ValidationError | void {


        const isAValidWordPath = /^\/.*\b\w+$/.test(value)

        const isValidHttpUrl =
            /^(https?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(value)

        const isValidMailtoString = /^mailto:([\w.-]+@[\w.-]+)(\?.+)?$/.test(value);

        const isValidTelString = /^tel:[\d-]+$/.test(value)

        const isValidWordThatStartsWithAHash = /^#.*\b\w+$/.test(value)

        const theValueIsNotValid = ![
            relativeOrAbsolutePathRegex.test(value),
            isAValidWordPath,
            isValidHttpUrl,
            isValidMailtoString,
            isValidTelString,
            isValidWordThatStartsWithAHash,
        ].some(Boolean)

        if (theValueIsNotValid) {

            return generateMarkdocErrorObject(
                "invalid-path",
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




export class DownloadAttribute extends MarkdocValidatorAttribute {

    returnMarkdocErrorObjectOrNothing(value: unknown): void | ValidationError {


        if (typeof value === "string" && value && !relativeOrAbsolutePathRegex.test(value))
            return generateMarkdocErrorObject(
                "invalid-attribute",
                "error",
                `If you are going to specify a path in the download attribute.
                Then please use either a relative or absolute path. 
                If you want the browser to choose please leave an empty string 
                `
            );


    }
};


export const a = getGenerateNonPrimarySchema({
    render: "a",
    attributes: {
        href: {
            type: AnchorAttribute,
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
            type: DownloadAttribute,
            errorLevel: "error",
            description: "Allows the user to download a file from the computer or the project file system"
        }

    },
    children: [
        "div",
        "span",
        "em",
        "strong",
        "abbr",
        "img",
    ]
})()
