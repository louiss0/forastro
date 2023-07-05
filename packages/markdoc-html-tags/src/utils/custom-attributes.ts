

import type { ValidationError, Config as MarkdocConfig, Scalar, } from "@markdoc/markdoc"
import { generateMarkdocErrorObject, generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight, generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight } from "packages/markdoc-html-tags/src/utils/helpers"
import type { ReturnMarkdocErrorObjectOrNothingContract } from "packages/markdoc-html-tags/src/utils/internal"


export abstract class MarkdocValidatorAttribute {




    validate(value: unknown, config: MarkdocConfig) {

        const res = this.returnMarkdocErrorObjectOrNothing(value, config)
        return res ? [res] : []

    }

    abstract returnMarkdocErrorObjectOrNothing(
        value: unknown,
        config: MarkdocConfig
    ): ValidationError | void

}

export class HttpURLOrPathAttribute extends MarkdocValidatorAttribute implements ReturnMarkdocErrorObjectOrNothingContract {


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


// TODO: TEST SrcSetAttribute
export class SrcSetAttribute extends HttpURLOrPathAttribute {


    protected readonly relativePathAndEitherViewportWidthOrWidthSizeRegex =
        /^(?<init_path>\.\.\/)+(?<folder_path>[a-z0-9\-_]+\/)*(?<filename>(?:\w+(?:\s?\w+)+)|[a-zA-Z0-9\-_]+)(?<extension>\.[a-z]{2,6})\s(?<width_or_viewport_width>\d{1,4}v?w)$/

    protected readonly relativePathAndOneToTwoPixelDensityRegex =
        /^(?<init_path>\.\.\/)+(?<folder_path>[a-z0-9\-_]+\/)*(?<filename>(?:\w+(?:\s?\w+)+)|[a-zA-Z0-9\-_]+)(?<extension>\.[a-z]{2,6})\s(?<one_to_two_pixel_density>[1-2]x)$/

    protected readonly absolutePathAndEitherViewportWidthOrWidthSizeRegex =
        /^(?<folder_path>[a-z0-9\-_]+\/)+(?<filename>(?:\w+(?:\s?\w+)+)|[a-zA-Z0-9\-_]+)(?<extension>\.[a-z]{2,6})\s(?<width_or_viewport_width>\d{1,4}v?w)$/

    protected readonly absolutePathAndOneToTwoPixelDensityRegex =
        /^(?<folder_path>[a-z0-9\-_]+\/)+(?<filename>(?:\w+(?:\s?\w+)+)|[a-zA-Z0-9\-_]+)(?<extension>\.[a-z]{2,6})\s(?<one_to_two_pixel_density>[1-2]x)$/


    override transform(value: string | Array<string>): Scalar {

        return typeof value !== "string" ? value.join(",") : value

    }


    private checkIfStringIsValid(value: string) {


        return [
            this.relativePathAndEitherViewportWidthOrWidthSizeRegex.test(value),
            this.relativePathAndOneToTwoPixelDensityRegex.test(value),
            this.absolutePathAndEitherViewportWidthOrWidthSizeRegex.test(value),
            this.absolutePathAndOneToTwoPixelDensityRegex.test(value),
            this.httpUrlRegex.test(value)
        ].some(Boolean)




    }

    override returnMarkdocErrorObjectOrNothing(value: unknown,): void | ValidationError {




        if (typeof value === "string") {



            return !this.checkIfStringIsValid(value)
                ? generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(
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
                ) : undefined


        }



        if (Array.isArray(value)) {


            if (!(value.length >= 2)) {

                return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(`
                        If you want to use an array you should use more than one value.
                        A string is better in that situation
                    `)

            }

            const everyValueIsAStringWithARelativeOrAbsolutePathsAndEitherAWidthSizeOrPixelDensity =
                value.every(
                    value => value === "string" && this.checkIfStringIsValid(value)
                )

            return !everyValueIsAStringWithARelativeOrAbsolutePathsAndEitherAWidthSizeOrPixelDensity
                ? generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(`
                        If you are using an array please use a string that specifies,
                         a relative or absolute path and either a width viewport width or 1-2 pixel density at the end.

                         Please use a space before writing the number. 
                          
                    `) : undefined

        }


        return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(`
                    You must return an array or a string when using this attribute.
                    Please write the string as a valid URL or a path to a file.
                    You can also specify a pixel density, a width or a viewport width.
                    When writing a array you must specify more than one value and specify,
                    a pixel density, a width or a viewport width.  
                `)

    }

}


// TODO: TEST SizesAttribute
export class SizesAttribute extends MarkdocValidatorAttribute {


    private readonly mediaSizesAttribute =
        /^(?<query>\((?:min|max)-width:\d{2,4}(?:em)?\))(?<extended_query>\s(?:and)\s\((?:min|max)-width:\d{2,4}(?:em)?\))?\s(?<number_unit>\d{2,4}v?w)$/


    transform(value: Array<string>): Scalar {

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



export class IntegerAttribute extends MarkdocValidatorAttribute implements ReturnMarkdocErrorObjectOrNothingContract {

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





