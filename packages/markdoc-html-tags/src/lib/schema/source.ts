import type { ValidationError } from "@markdoc/markdoc";
import { MarkdocValidatorAttribute, getGenerateNonPrimarySchema } from "src/utils";

export class SourceSetAttribute extends MarkdocValidatorAttribute {

    returnMarkdocErrorObjectOrNothing(value: unknown): void | ValidationError {



    }
};


const source = getGenerateNonPrimarySchema({
    render: "source",
    selfClosing: true,
    attributes: {
        srcset: {
            type: SourceSetAttribute,
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
