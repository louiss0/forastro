import type { Scalar, ValidationError } from "@markdoc/markdoc";
import { MarkdocAttributeSchemas } from "src/lib/attributes";

const { height, width } = MarkdocAttributeSchemas

import {
    HttpURLOrPathAttribute,
    MarkdocValidatorAttribute,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight,
    getGenerateNonPrimarySchema
} from "src/utils";


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


    transform(value: string | Array<string>): Scalar {

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


// TODO: TEST MediaAttribute
export class MediaAttribute extends MarkdocValidatorAttribute {
    private readonly deviceOperatorAndOrientationRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<orientation_query>\(orientation:(?:portrait|landscape)\))?/


    private readonly deviceOperatorAndAspectRatioRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<aspect_ratio_query>(device-)?aspect-ratio:(?:[1-16]{1,2}\/[1-16]{1,2}))/

    private readonly deviceOperatorAndMediaQueryRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<screen_or_device_size_query>\((?:min-|max-)?(?:device-)?(?:width|height):\d{2,4}(?:em)?\))/


    private readonly deviceOperatorAndColorOrColorIndexRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<color_or_color_index>\(color(?:-index)?:\d{1,3}\))/

    private readonly deviceOperatorAndMonoChromeRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<monochrome_query>\(monochrome:\d\))/

    private readonly deviceOperatorAndResolutionRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<resolution_query>\(resolution:\d{1,3}(?:dpi|dpcm)\))/

    private readonly deviceOperatorAndGridRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<grid_query>\(grid:\d{1,3}\))/

    private readonly deviceOperatorAndScanRegex =
        /(?<device_choice>screen|aural|braille|print|tty|tv|handheld|projection)\s(?<operator>and|not|,)\s(?<scan_query>\(scan:(?:interlace|progressive)\))/

    override returnMarkdocErrorObjectOrNothing(value: unknown): void | ValidationError {



        if (typeof value !== "string") {

            return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight("string")
        }

        const valueIsAValidMediaQuery = [
            this.deviceOperatorAndColorOrColorIndexRegex.test(value),
            this.deviceOperatorAndAspectRatioRegex.test(value),
            this.deviceOperatorAndMediaQueryRegex.test(value),
            this.deviceOperatorAndScanRegex.test(value),
            this.deviceOperatorAndResolutionRegex.test(value),
            this.deviceOperatorAndMonoChromeRegex.test(value),
            this.deviceOperatorAndGridRegex.test(value),
            this.deviceOperatorAndOrientationRegex.test(value),
        ].some(Boolean)

        if (!valueIsAValidMediaQuery) {

            return generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(`
                You need to supply the correct media query.
                Remember not to put any spaces when writing code in the parenthesises of a media query.
                You must write a media query like this 
                
                <device_choice> operator <media_query>
                
                device_choices are: screen|aural|braille|print|tty|tv|handheld|projection
                
                operators are: and|not|,

                media_query's are: grid|scan|color|color-index|resolution|width|height|aspect-ratio|orientation 

            `)
        }


    }
}


export const source = getGenerateNonPrimarySchema({
    render: "source",
    selfClosing: true,
    description: "This is the schema for the HTML source tag",
    attributes: {
        srcset: {
            type: SrcSetAttribute,
            required: true,
            description: "A set of urls and image sizes that are required to use upload the picture",

        },

        sizes: {
            type: SizesAttribute,
            description: "The size of each image in a media query",
            errorLevel: "warning",
        },
        media: {
            type: MediaAttribute,
            description: "The art resolution or time for an image to appear in a media query",
            errorLevel: "warning",
        },
        type: {
            type: String,
            errorLevel: "warning",
            description: "The type of image that is being used",
            matches: /^image\/(?<image_type>jpg|jpeg|gif|tiff|webp|png)$/
        },
        width,
        height,
    }
})()
