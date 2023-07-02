
import * as markdoc from "@markdoc/markdoc";

const { Tag } = markdoc

import { MarkdocValidatorAttribute, generateMarkdocErrorObject, generateSelfClosingTagSchema, } from "packages/markdoc-html-tags/src/utils";

export class AbbreviationAttribute extends MarkdocValidatorAttribute {

    returnMarkdocErrorObjectOrNothing(value: string,): markdoc.ValidationError | void {




        const matchCapitalisedWordCaptureOtherCapitalizedWordsOnOneLineRegex =
            /^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/;

        const thePrimaryAttributeIsNotASetOfWordsThatAreCapitalizedAndSpaced =
            !matchCapitalisedWordCaptureOtherCapitalizedWordsOnOneLineRegex.test(value);


        if (thePrimaryAttributeIsNotASetOfWordsThatAreCapitalizedAndSpaced)
            return generateMarkdocErrorObject(
                "invalid-attribute",
                "critical",
                `You are supposed to supply only words that are capitalised with Spaces.
                This word ${value} doesn't meet that condition.
          `
            )

    }
}



export const abbr = generateSelfClosingTagSchema<RegExp | null, StringConstructor | markdoc.CustomAttributeType, "abbr">(
    {
        render: "abbr",
        validationType: AbbreviationAttribute,
        description: "A tag that automatically creates an abbreviation of a capitalised word"
    },
    {
        attributes: {
            label: {
                type: String,
                required: false,
                errorLevel: "error",
                matches: /[A-Z]/
            }
        },
        transform(node) {
            const { primary, label } = node.attributes;

            return new Tag("abbr", {
                ...node.transformAttributes(node.attributes),
                title: primary
            }, label ? [label] : primary.match(/[A-Z]/g))
        }
    }
)
