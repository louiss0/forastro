import * as markdoc from "@markdoc/markdoc";
const { Tag, } = markdoc
import {
  MarkdocValidatorAttribute,
  generateMarkdocErrorObject,
  generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight,
  generateNonPrimarySchema,
  generateSelfClosingTagSchema,
} from "packages/markdoc-html-tags/src/utils";



export const sup = generateSelfClosingTagSchema("sup", String,);
export const span = generateSelfClosingTagSchema("span", String);
export const sub = generateSelfClosingTagSchema("sub", String,);
export const cite = generateSelfClosingTagSchema("cite", String,);
export const code = generateSelfClosingTagSchema("code", String,);
export const dfn = generateSelfClosingTagSchema("dfn", String,);
export const samp = generateSelfClosingTagSchema("samp", String,);
export const time = generateSelfClosingTagSchema("time", String,);
export const mark = generateSelfClosingTagSchema("mark", String,);
export const q = generateSelfClosingTagSchema("q", String,);
export const kbd = generateSelfClosingTagSchema("kbd", String,);
export const bdo = generateSelfClosingTagSchema("bdo", String,);
export const data = generateSelfClosingTagSchema("data", String,);

// export const sub = generateSelfClosingTagSchema("sub", String,);

// export const sub = generateSelfClosingTagSchema("sub", String,);
// export const a = generateSelfClosingTagSchema("a", String,);


// TODO: Split Schemas with Attributes into separate files
// TODO: Remember to setup vitest 

// TODO Put the schemas into a separate library. 

export const anchor = generateNonPrimarySchema("a", {
  href: {
    type: class extends MarkdocValidatorAttribute {

      override returnMarkdocErrorObjectOrNull(value: unknown): markdoc.ValidationError | null {

        return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight(
          "string",
          value
        )
          ?? this.checkIfHrefIsValid(value as string)

      }

      checkIfHrefIsValid(value: string) {


        const isAValidWordPath = /^\/.*\b\w+$/.test(value)

        const isAValidRelativeOrAbsolutePath = /^(\/|\.?\.?\/).*/.test(value)

        const isValidHttpsUrl = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(value)

        const isValidMailtoString = /^mailto:([\w.-]+@[\w.-]+)(\?.+)?$/.test(value);

        const isValidTelString = /^tel:[^?\s]+$/.test(value)

        const theValueIsNotValid = ![
          isAValidRelativeOrAbsolutePath,
          isAValidWordPath,
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

    },
    required: true,
  }
}, {
  children: [
    "div",
    "span",
    "em",
    "strong",
    "abbr",
    "img",
  ]
})

export const abbrSchema = generateSelfClosingTagSchema(
  "abbr",
  class extends MarkdocValidatorAttribute {

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
  },
  {
    transform(node) {
      const { primary } = node.attributes;

      return new Tag("abbr", {
        ...node.transformAttributes(node.attributes),
        title: primary
      }, primary.match(/[A-Z]/g))
    }
  }
)

