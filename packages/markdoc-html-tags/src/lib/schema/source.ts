import type { ValidationError } from "@markdoc/markdoc";
import { MarkdocAttributeSchemas } from "packages/markdoc-html-tags/src/lib/attributes";

const { height, width } = MarkdocAttributeSchemas

import {
    MarkdocValidatorAttribute,
    SizesAttribute,
    SrcSetAttribute,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight,
    generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight,
    getGenerateNonPrimarySchema
} from "packages/markdoc-html-tags/src/utils";




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
