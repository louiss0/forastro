

import type { ValidationError, Config as MarkdocConfig, Scalar, CustomAttributeTypeInterface, } from "@markdoc/markdoc"
import { generateMarkdocErrorObject, generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight } from "src/utils/helpers"


export abstract class MarkdocValidatorAttribute implements CustomAttributeTypeInterface {




    validate(value: unknown, config: MarkdocConfig) {

        const res = this.returnMarkdocErrorObjectOrNothing(value, config)
        return res ? [res] : []

    }

    abstract returnMarkdocErrorObjectOrNothing(
        value: unknown,
        config: MarkdocConfig
    ): ValidationError | void

}

export class HttpURLOrPathAttribute extends MarkdocValidatorAttribute {


    readonly relativePathRegex =
        /^(?<init_path>\.\.\/)+(?<folder_path>[a-z0-9\-_]+\/)*(?<filename>(?:\w+(?:\s?\w+)+)|[a-zA-Z0-9\-_]+)(?<extension>\.[a-z]{2,6})?$/

    readonly absolutePathRegex = /^(?<folder_path>[a-z0-9\-_]+\/)+(?<filename>(?:\w+(?:\s?\w+)+)|[a-zA-Z0-9\-_]+)(?<extension>\.[a-z]{2,6})?$/


    readonly httpUrlRegex =
        /^(https?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/


    returnMarkdocErrorObjectOrNothing(value: unknown,): void | ValidationError {


        if (value !== "string") {
            return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight("string")
        }

        const isValidPathOrHTTPUrl = [
            this.httpUrlRegex.test(value),
            this.relativePathRegex.test(value),
            this.absolutePathRegex.test(value)
        ].some(Boolean)

        if (!isValidPathOrHTTPUrl) {

            return generateMarkdocErrorObject(
                "invalid-attribute",
                "error",
                `The string ${value} must be a valid URL, a Relative or Absolute Path.

                A relative path must have:
                
                1 or more ( ../ ) which is a relative path

                0 or more ( word/ )  which is a file path. 

                A file name and an extension which is a dot (.) followed by a word with 2-6 letters.  
                
                A absolute path must have:

                1 or more ( ../ ) which is a relative path

                0 or more ( word/ )  which is a file path. 

                A file name and an extension which is a dot (.) followed by a word with 2-6 letters.
                
                `
            )

        }


    }


    transform(value: string): Scalar {

        return value?.trim()

    }

};


export class DataObjectAttribute extends MarkdocValidatorAttribute {



    override returnMarkdocErrorObjectOrNothing(value: object,): ValidationError | void {

        const regexToCheckIfAValueOnlyHasAlphanumericCharacters = /^[A-Za-z]+$/

        const keysWithoutOnlyAlphanumericCharacters = Object.keys(value)
            .filter(string => !regexToCheckIfAValueOnlyHasAlphanumericCharacters.test(string))

        if (keysWithoutOnlyAlphanumericCharacters.length !== 0)
            return generateMarkdocErrorObject(
                "invalid-characters",
                "error",
                `These  are not good keys ${keysWithoutOnlyAlphanumericCharacters.join(",")}. 
                They must be words with no spaces.
                `
            )


    }

}

export class IntegerAttribute extends MarkdocValidatorAttribute {

    override returnMarkdocErrorObjectOrNothing(value: unknown,): void | ValidationError {

        if (typeof value !== "number")
            return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight("number")


        if (!Number.isInteger(value)) {

            return generateMarkdocErrorObject(
                "invalid-value",
                "error",
                `The value ${value} is not an integer. 
                Please provide an integer not a float  
                `
            )
        }

    }
};





