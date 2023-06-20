

import type { ValidationError, Config as MarkdocConfig, Scalar, CustomAttributeTypeInterface,  } from "@markdoc/markdoc"
import { generateMarkdocErrorObject, generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight } from "src/utils/helpers"


export abstract class MarkdocValidatorAttribute implements Required<CustomAttributeTypeInterface> {


    transform(value: Scalar) {

        return value
    }

    validate(value: unknown, config: MarkdocConfig) {

        const res = this.returnMarkdocErrorObjectOrNothing(value, config)
        return res ? [res] : []

    }

    abstract returnMarkdocErrorObjectOrNothing(
        value: unknown,
        config: MarkdocConfig
    ): ValidationError | void

}

export  class HttpURLOrPathAttribute extends MarkdocValidatorAttribute {

    protected readonly relativeOrAbsolutePathRegex =
        
        /^(\/|\.?\.?\/)\S+(\/[A-Za-z0-9-_\s]+\.[a-z0-9]+|\/[A-Za-z0-9-_\s]+)/


    protected readonly httpUrlRegex =
            /^(https?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/

    
    returnMarkdocErrorObjectOrNothing(value: unknown,): void | ValidationError {
    

    if (value !== "string") {
        return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight("string")
    }
    
    const isValidPathOrHTTPUrl= [this.httpUrlRegex.test(value), this.relativeOrAbsolutePathRegex.test(value)].some(Boolean)
        
     if (!isValidPathOrHTTPUrl) {
        
         return generateMarkdocErrorObject(
             "invalid-attribute",
             "error",
             `The string ${value} must be a valid URL, a Relative or Absolute Path `
        )
         
     }

   
    }

    
   override transform(value: string): Scalar {
       
       
       return value.trim()
       
    }
    
};
