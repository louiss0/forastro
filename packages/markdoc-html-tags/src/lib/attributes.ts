import type { Scalar, SchemaAttribute, ValidationError, ValidationType } from "@markdoc/markdoc";
import {
    MarkdocValidatorAttribute,
    createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue,
    generateMarkdocErrorObject
} from "src/utils";



export type TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T> =
    T extends ReadonlyArray<string> | RegExp
    ? StringConstructor
    : T extends ReadonlyArray<number>
    ? NumberConstructor
    : never



type TypeIsAStringOrNumberReturnTheValuesIfRegexReturnStringElseNever<T> =
    T extends ReadonlyArray<string> | ReadonlyArray<number>
    ? T[number]
    : T extends RegExp
    ? string
    : never

type ReturnTypeBasedOnConstructor<T> =
    T extends StringConstructor | "String" ? string :
    T extends NumberConstructor | "Number" ? number :
    T extends BooleanConstructor | "Boolean" ? boolean :
    T extends ArrayConstructor | "Array" ? Array<string> | Array<number> | Array<Record<string, Scalar>> :
    T extends ObjectConstructor | "Object" ? Record<string, Scalar> :
    T extends Array<ValidationType> ? ReturnTypeBasedOnConstructor<T[number]> : never

export type ProperSchemaMatches = Exclude<SchemaAttribute["matches"], Array<string> | undefined>
    | ReadonlyArray<number>
    | ReadonlyArray<string>


export type RequiredSchemaAttributeType = Exclude<SchemaAttribute["type"], undefined>

export type MarkdocAttributeSchema<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType> = {
    type: T extends ReadonlyArray<unknown> | RegExp
    ? TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T> : U
    default?: T extends ReadonlyArray<unknown> | RegExp
    ? TypeIsAStringOrNumberReturnTheValuesIfRegexReturnStringElseNever<T>
    : ReturnTypeBasedOnConstructor<U>
    matches?: T
} & Omit<SchemaAttribute, "matches" | "default" | "type">


export type PrimaryMarkdocAttributeSchema<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType> =
    MarkdocAttributeSchema<T, U>
    & { render?: true }

export type SchemaAttributesWithAPrimaryKey<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType> = {
    primary: PrimaryMarkdocAttributeSchema<T, U>
    [key: string]: MarkdocAttributeSchema<T, U>
}

export type SchemaAttributesWithNoPrimaryKey<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType> =
    { primary?: never }
    & Record<string, MarkdocAttributeSchema<T, U>>




const generateMarkdocAttributeSchema =
    <T extends RequiredSchemaAttributeType, U extends ProperSchemaMatches = null>() =>
        <V extends MarkdocAttributeSchema<U, T>>(config: V) =>
            Object.freeze(config)


export const title = generateMarkdocAttributeSchema()({
    type: String,
    validate(value: string,) {

        return createAnArrayOfMarkdocErrorObjectsBasedOnEachConditionThatIsTrue([
            [
                /\b\w+ (?: [\w.,!?':;-]+)*\b/.test(value),
                generateMarkdocErrorObject(
                    "invalid-attribute",
                    "error",
                    "THe title must contain A sentence with proper punctuation"
                )
            ]
        ])

    },
    description: "This expression is used to match string that are written using proper punctuation",
    errorLevel: "error",
});


export const translate = generateMarkdocAttributeSchema<StringConstructor, ["yes", "no"]>()({
    type: String,
    default: "yes",
    matches: [
        "yes",
        "no",
    ]
});


const SUITABLE_LANGUAGES_FOR_THE_LANG_ATTRIBUTE = [
    "aa", "ab", "ace", "ach", "ada", "ady", "ae", "aeb", "af", "afh", "agq", "ain", "ak", "akk", "akz", "ale", "aln", "alt", "am", "an", "ang", "anp", "ar", "ar-001", "arc", "arn", "aro", "arp", "arq", "arw", "ary", "arz", "as", "asa", "ase", "ast", "av", "avk", "awa", "ay", "az", "az-Arab",
    "ba", "bal", "ban", "bar", "bas", "bax", "bbc", "bbj", "be", "bej", "bem", "bew", "bez", "bfd", "bfq", "bg", "bgn", "bho", "bi", "bik", "bin", "bjn", "bkm", "bla", "bm", "bn", "bo", "bpy", "bqi", "br", "bra", "brh", "brx", "bs", "bss", "bua", "bug", "bum", "byn", "byv",
    "ca", "cad", "car", "cay", "cch", "ccp", "ce", "ceb", "cgg", "ch", "chb", "chg", "chk", "chm", "chn", "cho", "chp", "chr", "chy", "ckb", "co", "cop", "cps", "cr", "crh", "crs", "cs", "csb", "cu", "cv", "cy",
    "da", "dak", "dar", "dav", "de", "del", "den", "dgr", "din", "dje", "doi", "dsb", "dtp", "dua", "dum", "dv", "dyo", "dyu", "dz", "dzg",
    "ebu", "ee", "efi", "egl", "egy", "eka", "el", "elx", "en", "en-AU", "en-CA", "en-GB", "en-US", "enm", "eo", "es", "es-419", "es-AR", "es-CL", "es-CO", "es-CR", "es-EC", "es-ES", "es-GT", "es-HN", "es-MX", "es-NI", "es-PA", "es-PE", "es-PR", "es-PY", "es-SV", "es-US", "es-UY", "es-VE", "et", "eu", "ewo", "ext",
    "fa", "fa-AF", "ff", "ff-Adlm", "ff-Latn", "fi", "fil", "fit", "fj", "fo", "fon", "fr", "fr-CA", "fr-CH", "frc", "frm", "fro", "frp", "frr", "frs", "fur", "fy",
    "ga", "gaa", "gag", "gan", "gay", "gba", "gbz", "gd", "gez", "gil", "gl", "glk", "gmh",
] as const

export const lang = generateMarkdocAttributeSchema<StringConstructor, typeof SUITABLE_LANGUAGES_FOR_THE_LANG_ATTRIBUTE>()({
    type: String,
    default: "en",
    errorLevel: "error",
    matches: SUITABLE_LANGUAGES_FOR_THE_LANG_ATTRIBUTE,
    description: "An attribute for specifying the language of an element"
});


export const ariaHidden = generateMarkdocAttributeSchema()({
    type: Boolean,
    required: false,
    description: "Ah attribute that specifies whether or not an element is hidden"
});

export const ariaLabelledBy = generateMarkdocAttributeSchema()({
    type: String,
    required: false,
    description: "A attribute that specifies which element is used to label the element"
});

export const ariaLabel = generateMarkdocAttributeSchema()({
    type: String,
    required: false,
    description: "A attribute that specifies the label for this element"
});



export const dir = generateMarkdocAttributeSchema<StringConstructor, ["auto", "ltr", "rtl"]>()({
    type: String,
    default: "auto",
    matches: [
        "auto",
        "ltr",
        "rtl",
    ],
    description: "An attribute for specifying the reading direction of the words in the content",
    errorLevel: "error"
});

export const draggable = generateMarkdocAttributeSchema<BooleanConstructor>()({
    type: Boolean,
    default: false,
    description: "An attribute that allows an element to be draggable",
    errorLevel: "error",
});

export const spellcheck = generateMarkdocAttributeSchema<BooleanConstructor>()({
    type: Boolean,
    default: false,
    description: "An attribute that allows an element to be spell checked",
    errorLevel: "error",
});



export const contenteditable = generateMarkdocAttributeSchema()({
    type: Boolean,
    description: "An attribute that allows an element's content to be editable",
    errorLevel: "error",
});


class DataObjectAttribute extends MarkdocValidatorAttribute {


    override transform(value: Record<string, Scalar>,): Scalar {


        const arrayTuplesWithKeysThatHaveDataAsThePrefixForEachWordAndIsCamelCased =
            Object.entries(value).map(([key, value]) => [`data${key.at(0)}${key.substring(1, -1).toUpperCase()}`, value])

        return Object.fromEntries(arrayTuplesWithKeysThatHaveDataAsThePrefixForEachWordAndIsCamelCased)


    }

    override returnMarkdocErrorObjectOrNull(value: object,): ValidationError | null {

        const regexToCheckIfAValueOnlyHasAlphanumericCharacters = /^[A-Za-z]+$/

        const keysWithoutOnlyAlphanumericCharacters = Object.keys(value)
            .filter(string => !regexToCheckIfAValueOnlyHasAlphanumericCharacters.test(string))

        return keysWithoutOnlyAlphanumericCharacters.length !== 0
            ? generateMarkdocErrorObject(
                "invalid-characters",
                "error",
                `These  are not good keys ${keysWithoutOnlyAlphanumericCharacters.join(",")}. 
                They must be words with no spaces.
                `
            ) : null


    }

}

export const dataMarkdocAttributeSchema = generateMarkdocAttributeSchema()({
    type: [Object, DataObjectAttribute],
    description: "An attribute that allows an element's content to be editable",
    errorLevel: "critical",
},);






