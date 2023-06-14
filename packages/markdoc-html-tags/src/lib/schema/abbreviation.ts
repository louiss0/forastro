
import { EnhancedTag, MarkdocValidatorAttribute, generateMarkdocErrorObject, generateSelfClosingTagSchema } from "src/utils";

class AbbreviationAttribute extends MarkdocValidatorAttribute {

    override returnMarkdocErrorObjectOrNull(value: unknown,) {



        if (typeof value !== "string") {
            return generateMarkdocErrorObject(
                "invalid-attribute",
                "critical",
                `The attribute must be a string`
            )
        }

        const matchCapitalisedWordCaptureOtherCapitalizedWordsOnOneLineRegex =
            /^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/;

        const thePrimaryAttributeIsNotASetOfWordsThatAreCapitalizedAndSpaced =
            !matchCapitalisedWordCaptureOtherCapitalizedWordsOnOneLineRegex.test(value);


        return thePrimaryAttributeIsNotASetOfWordsThatAreCapitalizedAndSpaced
            ? generateMarkdocErrorObject(
                "invalid-attribute",
                "critical",
                `You are supposed to supply only words that are capitalised with Spaces
           This word ${value} doesn't meet that condition.
          `
            )
            : null

    }
}



export const abbr = generateSelfClosingTagSchema(
    {
        render: "abbr",
        validationType: AbbreviationAttribute,
        description: ""
    },
    {
        transform(node) {
            const { primary } = node.attributes;

            return new EnhancedTag("abbr", {
                ...node.transformAttributes(node.attributes),
                title: primary
            }, primary.match(/[A-Z]/g))
        }
    }
)

