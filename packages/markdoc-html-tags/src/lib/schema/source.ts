import {
    HttpURLOrPathAttribute,
    getGenerateNonPrimarySchema
} from "src/utils";



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
            type: Number,
        },
        height: {
            type: Number,
        },
    }

})()
