export * from './lib/asciidoc';
import { z } from "astro/zod";

const authorSchema = z.string().regex(
    /^(?:[A-Z][a-z]+\s)+[A-Z][a-z]+$/,
    "An author should have at least a first and last name both capitalized"
);
export const asciidocBaseSchema = z.object({
    doctitle: z.string().regex(
        /[\w\s\d]+/,
        "Please make sure your title is one with words letters and spaces"
    ),
    docdate: z.string().date(),
    email: z.string().email().optional(),
    localdate: z.string().date(),
    author: authorSchema,
    authors: authorSchema.array(),
    authorinitials: z.string().regex(/[A-Z]+/),
    firstname: z.string().regex(/[A-Z][a-z]+/),
    middlename: z.string().regex(/[A-Z][a-z]+/),
    lastname: z.string().regex(/[A-Z][a-z]+/),
    description: z.string()
        .min(35, "It's good for a description to at least be two sentences")
        .max(160, "A title needs to be at least 160 characters max")
}).transform((parsedInput) => {

    const {
        doctitle,
        docdate,
        localdate,
        authorinitials,
        firstname,
        lastname,
        middlename,
        ...rest
    } = parsedInput

    return {
        title: doctitle,
        authorInitials: authorinitials,
        firstName: firstname,
        middleName: middlename,
        lastName: lastname,
        createdAt: localdate,
        updatedAt: docdate,
        ...rest
    }

})

export type AsciidocBaseSchema = z.infer<typeof asciidocBaseSchema>

export const ASCIIDOC_POST_STAGE = z.enum(
    [
        "draft",
        "published",
        "editing"
    ]
);

export type AsciidocPostStage = z.infer<typeof ASCIIDOC_POST_STAGE>

export const asciidocDraftSchema = asciidocBaseSchema.and(
    z.object({
        stage: ASCIIDOC_POST_STAGE
    })
)

