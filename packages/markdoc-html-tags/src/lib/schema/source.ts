import {
    HttpURLOrPathAttribute,
    IntegerAttribute,
    getGenerateNonPrimarySchema
} from "src/utils";

// TODO: create an attribute for the media, type,





export const source = getGenerateNonPrimarySchema({
    render: "source",
    selfClosing: true,
    attributes: {
        srcset: {
            type: HttpURLOrPathAttribute,
            required: true,
            description: "A set of urls and image sizes that are required to use upload the picture"
        },
        width: {
            type: IntegerAttribute,
            description: "The width of the image"
        },
        height: {
            type: IntegerAttribute,
            description: "The height of the image"
        },
    }

})()
