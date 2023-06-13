import type { ValidationError } from "@markdoc/markdoc"
import {
    MarkdocValidatorAttribute,
    generateMarkdocErrorObject,
    generateNonPrimarySchema
} from "packages/markdoc-html-tags/src/utils"


export class AnchorAttribute extends MarkdocValidatorAttribute {

    override returnMarkdocErrorObjectOrNull(value: string): ValidationError | null {

        return this.checkIfHrefIsValid(value)

    }

    checkIfHrefIsValid(value: string) {


        const isAValidWordPath = /^\/.*\b\w+$/.test(value)

        const isAValidRelativeOrAbsolutePath = /^(\/|\.?\.?\/).*/.test(value)

        const isValidHttpsUrl = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(value)

        const isValidMailtoString = /^mailto:([\w.-]+@[\w.-]+)(\?.+)?$/.test(value);

        const isValidTelString = /^tel:[^?\s]+$/.test(value)

        const isValidWordThatStartsWithAHash = /^#.*\b\w+$/.test(value)

        const theValueIsNotValid = ![
            isAValidRelativeOrAbsolutePath,
            isAValidWordPath,
            isValidWordThatStartsWithAHash,
            isValidHttpsUrl,
            isValidMailtoString,
            isValidTelString
        ].some(Boolean)

        return theValueIsNotValid
            ? generateMarkdocErrorObject(
                "invalid-path",
                "error",
                `This value ${value} is not a valid href attribute.
          It must be one of these things.
          A string with a / at the beginning and a word at the end.
          A valid HTTP URL.
          A valid mailto string 
          A valid tel string. 
          A relative or absolute path.`
            ) : null


    }

}

export const a = generateNonPrimarySchema({
    render: "a",
    attributes: {
        href: {
            type: [String, AnchorAttribute],
            required: true,
        },
    },
    children: [
        "div",
        "span",
        "em",
        "strong",
        "abbr",
        "img",
    ]
})
