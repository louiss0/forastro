import type {  ConfigFunction, NodeType, Scalar, Schema, ValidationError } from "@markdoc/markdoc";
import {
    HttpURLOrPathAttribute,
    IntegerAttribute,
    MarkdocValidatorAttribute,
    generateMarkdocErrorObject,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight,
    getGenerateNonPrimarySchema
} from "src/utils";

// TODO: create an attribute for the media, type,


class SrcSetAttribute extends HttpURLOrPathAttribute {
        

        protected readonly validStringThatHoldsOnlyRelativeOrAbsolutePathsAndEitherAWidthSizeOrPixelDensityRegex =
   /^(?:\.?\.?\/[\w\/]+\/\w+\.[a-z]{3,4}\s?(?:\d+(?:w|vw)|[1-2]x)?)(?:,\s(\.?\.?\/[\w\/]+\/\w+\.[a-z]{3,4}\s(?:\d+(?:w|vw)|[1-2]x)))*$|^$/g
        
        returnMarkdocErrorObjectOrNothing(value: unknown, ): void | ValidationError {
            

            if (typeof value !== "string") {
                return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight("string")
            }

            const stringIsValid = [
                this.validStringThatHoldsOnlyRelativeOrAbsolutePathsAndEitherAWidthSizeOrPixelDensityRegex.test(value),
                this.httpUrlRegex.test(value)
            ].some(Boolean)
            
            if (!stringIsValid) {
                return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(
                    `This value is ${value} not valid.
                    You must specify a srcset value that has a valid absolute or relative path. 
                    You can either have a valid width or a valid pixel density.
                    If you do use a space for each of them. 
                    Ex: /path/to/image.jpg 

                    If you specify more then one path you must specify a width or a pixel density.
                    You must use a comma, space , then specify the next path if you want to specify
                    more paths.
                    
                    Ex: /path/to/image.jpg 30w /path/to/image-2.jpeg 40w
                    
                    Ex: /path/to/image.jpg  /path/to/image-2.jpeg 440w
                    
                    If you are trying to use a url please use one that is http 
                    
                    `
                )
            }

        }

    }


class SizesAttribute extends MarkdocValidatorAttribute {


    private readonly mediaSizesAttribute =
        /^(?<query>\((?:min|max)-width:\d{2,4}(?:em)?\))(?<extended_query>\s(?:and)\s\((?:min|max)-width:\d{2,4}(?:em)?\))?\s(?<number_unit>\d{2,4}v?w)$/

    
    override transform(value: Array<string>): Scalar {
        
        return value.join(",")

    }

    
    
    override returnMarkdocErrorObjectOrNothing(value: unknown): void | ValidationError {
        
        if (!Array.isArray(value)) {
            return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight("array")
        }

        const invalidMediaQueryAndSizes = value.filter(
            data => typeof data !== "string" || !this.mediaSizesAttribute.test(data)
        )

        if (invalidMediaQueryAndSizes) {

            return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(`
                The values that you supplied are incorrect.
                You are supposed to supply a min|max width query along with sizes for this attribute.
                Ex: (min-width:40em) 45w.
                Ex: (min-width:40em) and (max-width:30) 45vw.

                You should remember to put v|vw when specifying a digit. 
                
                The digit must only have 2-4 digits.
                
                You have to specify only one media query and size per string.

                These ${invalidMediaQueryAndSizes.join(",")} aren't the right values. 

            `)
            
        }


    }
 }

class MediaAttribute extends MarkdocValidatorAttribute {
    returnMarkdocErrorObjectOrNothing(value: unknown): void | ValidationError {
        
    }
}


export const source = getGenerateNonPrimarySchema({
    render: "source",
    selfClosing: true,
    attributes: {
        srcset: {
            type: SrcSetAttribute,
            required: true,
            description: "A set of urls and image sizes that are required to use upload the picture",
             
        },
        width: {
            type: IntegerAttribute,
            description: "The width of the image",
            errorLevel: "warning",
        },
        height: {
            type: IntegerAttribute,
            description: "The height of the image",
            errorLevel: "warning",
        },
    }

})()
