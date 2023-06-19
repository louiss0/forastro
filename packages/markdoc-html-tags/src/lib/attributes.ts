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
    T extends ObjectConstructor | "Object" ? Record<string, Scalar> : never

export type ProperSchemaMatches = Exclude<SchemaAttribute["matches"], Array<string> | undefined>
    | ReadonlyArray<number>
    | ReadonlyArray<string>


export type RequiredSchemaAttributeType = Exclude<SchemaAttribute["type"], undefined | Array<ValidationType>>

export type MarkdocAttributeSchema<T extends ProperSchemaMatches, U extends RequiredSchemaAttributeType> = {
    type: T extends ReadonlyArray<unknown> | RegExp
    ? TypeIsAStringOrNumberReturnStringOrNumberConstructorElseReturnMarkdoc<T> : U
    default?: T extends ReadonlyArray<unknown> | RegExp
    ? TypeIsAStringOrNumberReturnTheValuesIfRegexReturnStringElseNever<T>
    : ReturnTypeBasedOnConstructor<U>
    matches?: T
} & Omit<SchemaAttribute, "matches" | "default" | "type" | "render">


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




const getGenerateMarkdocAttributeSchema =
    <
        T extends RequiredSchemaAttributeType,
        U extends ProperSchemaMatches,
        V extends Pick<MarkdocAttributeSchema<U, T>, "errorLevel" | "description" | "type" | "required">
        = Required<Pick<MarkdocAttributeSchema<U, T>, "errorLevel" | "description" | "type" | "required">>,
    >
        (primaryConfig: V) =>
        <W extends Omit<MarkdocAttributeSchema<U, T>, GetFilledKeys<V>>>
            (secondaryConfig?: W) => Object.freeze(Object.assign({ ...primaryConfig }, secondaryConfig))

type GetFilledKeys<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends undefined | null ? never : K
}[keyof T]


const generateProperStringAttributeSchema = getGenerateMarkdocAttributeSchema({
    type: String,
    required: false,
    errorLevel: "error",
})

const generateBooleanAttributeSchemaThatIsNotRequired = getGenerateMarkdocAttributeSchema({
    type: Boolean,
    required: false,
    errorLevel: "error",
})

export const title = generateProperStringAttributeSchema({
    description: "This expression is used to match string that are written using proper punctuation",
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

});



export const translate = generateProperStringAttributeSchema({
    description: "This attribute is for the making translations when it comes to words",
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

export const lang = generateProperStringAttributeSchema({
    description: "An attribute for specifying the language of an element",
    default: "en",
    matches: SUITABLE_LANGUAGES_FOR_THE_LANG_ATTRIBUTE,
})


export const ariaHidden = generateBooleanAttributeSchemaThatIsNotRequired({
    description: "Ah attribute that specifies whether or not an element is hidden",

});

export const ariaLabelledBy = generateBooleanAttributeSchemaThatIsNotRequired({
    description: "A attribute that specifies which element is used to label the element",
});

export const ariaLabel = generateBooleanAttributeSchemaThatIsNotRequired({
    description: "A attribute that specifies the label for this element",
});



export const dir = generateProperStringAttributeSchema({
    description: "An attribute for specifying the reading direction of the words in the content",
    default: "auto",
    matches: [
        "auto",
        "ltr",
        "rtl",
    ],
});

export const draggable = generateBooleanAttributeSchemaThatIsNotRequired({
    default: false,
    description: "An attribute that allows an element to be draggable",
});

export const spellcheck = generateBooleanAttributeSchemaThatIsNotRequired({
    description: "An attribute that allows an element to be spell checked",
    default: false,
});



export const contenteditable = generateBooleanAttributeSchemaThatIsNotRequired({
    description: "An attribute that allows an element's content to be editable",
});


class DataObjectAttribute extends MarkdocValidatorAttribute {


    override transform(value: Record<string, Scalar>,): Scalar {


        const arrayTuplesWithKeysThatHaveDataAsThePrefixForEachWordAndIsCamelCased =
            Object.entries(value).map(([key, value]) => [`data${key.at(0)}${key.substring(1, -1).toUpperCase()}`, value])

        return Object.fromEntries(arrayTuplesWithKeysThatHaveDataAsThePrefixForEachWordAndIsCamelCased)


    }


    override returnMarkdocErrorObjectOrNothing(value: object,): ValidationError | void {

        const regexToCheckIfAValueOnlyHasAlphanumericCharacters = /^[A-Za-z]+$/

        const keysWithoutOnlyAlphanumericCharacters = Object.keys(value)
            .filter(string => !regexToCheckIfAValueOnlyHasAlphanumericCharacters.test(string))

        if (keysWithoutOnlyAlphanumericCharacters.length !== 0)
            return generateMarkdocErrorObject(
                "invalid-characters",
                "error",
                `These  are not good keys ${keysWithoutOnlyAlphanumericCharacters.join(",")}. 
                They must be words with no spaces.
                `
            )


    }

}

export const dataMarkdocAttributeSchema = getGenerateMarkdocAttributeSchema({
    type: DataObjectAttribute,
    description: "An attribute that allows an element's content to be editable",
    errorLevel: "critical",
    required: false
})();






