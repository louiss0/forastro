import { expect, } from "vitest";
import { z } from 'astro/zod';



// const markdocErrorObjectStructure = {
//     id: "invalid-",
//     level: "",
//     message: "",
//     location: {
//         file: "",
//         start: {
//             line: 0,
//             character: 0
//         },
//         end: {
//             line: 0,
//             character: 0
//         }
//     }
// }

const lineAndCharacterSchema = z.object({
    line: z.number(),
    character: z.number()
})
const markdocErrorObjectSchema = z.object({
    id: z.string().includes("invalid"),
    level: z.enum(["error", "critical"]),
    message: z.string(),
    location: z.object({
        file: z.string(),
        start: lineAndCharacterSchema,
        end: lineAndCharacterSchema

    }).optional()
})

const allowedMarkdocTypesAsStringsList = ["string", "array", "number", "boolean", "object",]

const markdocErrorObjectSchemaForInvalidType = markdocErrorObjectSchema.extend({
    id: z.literal("invalid-type"),
    level: z.literal("error"),
    message: z.string().refine(
        (arg) => allowedMarkdocTypesAsStringsList.some((value) => arg.includes(value)),
        `A markdoc Errors object that checks for a type must have one of these ${allowedMarkdocTypesAsStringsList.join(", ")} words in the message`
    )
})

const markdocErrorObjectSchemaForInvalidValue = markdocErrorObjectSchema.extend({
    id: z.literal("invalid-value"),
    level: z.literal("error")
})

expect.extend({

    toEqualMarkdocErrorObject(received: unknown,) {


        const res = markdocErrorObjectSchema.safeParse(received)

        return res.success
            ? {
                pass: true,
                expected: received,
                actual: received,
                message: () => `Received ${this.utils.printReceived(
                    markdocErrorObjectSchema.shape
                )} is equal to ${this.utils.printExpected(markdocErrorObjectSchema.shape)}`,
            }
            : {
                pass: false,
                actual: received,
                expected: markdocErrorObjectSchema.shape,
                message: () => res.error.format()._errors.join(",")

            }

    },

    toEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRight(received: unknown,) {

        const res = markdocErrorObjectSchemaForInvalidType.safeParse(received)

        return res.success
            ? {
                pass: true,
                message: () => this.utils.printExpected(markdocErrorObjectSchemaForInvalidType.shape),
                actual: received,
                expected: received,

            }
            : {
                pass: false,
                message: () => this.utils.printReceived(received),
                actual: received,
                expected: markdocErrorObjectSchemaForInvalidType.shape,
            }

    },


    toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight(received: unknown) {

        const res = markdocErrorObjectSchemaForInvalidValue.safeParse(received)


        return res.success
            ? {
                pass: true,
                message: () => this.utils.printExpected(markdocErrorObjectSchemaForInvalidValue.shape),
                actual: received,
                expected: received,

            }
            : {
                pass: false,
                message: () => this.utils.printReceived(received),
                actual: received,
                expected: markdocErrorObjectSchemaForInvalidValue.shape,
            }
    },



}
)


