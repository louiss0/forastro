import type { CustomAttributeTypeInterface, Scalar, ValidationError } from "@markdoc/markdoc";


export type AllowedMarkdocTypesAsStrings = "string" | "number" | "array" | "boolean" | "object"

export interface ReturnMarkdocErrorObjectOrNothingContract extends CustomAttributeTypeInterface {
    returnMarkdocErrorObjectOrNothing(value: unknown): void | ValidationError
}

export interface CustomAttributeTypeInterfaceContract extends CustomAttributeTypeInterface {
    returnMarkdocErrorObjectOrNothingContract?: never
}




export const isObject = (value: unknown): value is Record<PropertyKey, unknown> =>
    typeof value === "object"
    && value != null
    && Object.keys(value)
        .every(isValidPropKey)


const isValidPropKey = (value: unknown): value is PropertyKey =>
    typeof value === "string"
    || typeof value === "number"
    || typeof value === "symbol"


export function toLowercaseWithDashes(str: string) {
    return str.replace(/(?<uppercasedLetter>[A-Z])/g, function (_, p1: Record<"uppercasedLetter", string>) {
        return `-${p1.uppercasedLetter.toLowerCase()}`;
    }).toLowerCase();
}

const isAViableMarkdocPrimitive = (value: unknown) =>
    typeof value === "string"
    || typeof value === "number"
    || typeof value === "boolean"
    || value === null

export const isAnObjectThatHasViableMarkdocValues = (value: unknown): value is Record<PropertyKey, Scalar> =>
    isObject(value) && Object.values(value).every(
        (value: unknown) => isAViableMarkdocPrimitive(value)
            || Array.isArray(value)
            && value.every(
                (value) => isAViableMarkdocPrimitive(value)
                    || isAnObjectThatHasViableMarkdocValues(value)
            )
    )

export const isViableMarkdocValue = (value: unknown): value is Scalar =>
    isAViableMarkdocPrimitive(value)
    || Array.isArray(value) && value.every(
        (value) => isAViableMarkdocPrimitive(value)
            || isAnObjectThatHasViableMarkdocValues(value)
    )
    || isAnObjectThatHasViableMarkdocValues(value);

export const isAnObjectWithStringKeysAndValuesThatAreStringsOrNumbers = (value: unknown): value is Record<"string", string | number> =>
    isObject(value)
    && Object.keys(value).every(
        (key) => typeof key === "string"
    )
    && Object.values(value).every(
        (value) => typeof value === "string" || typeof value === "number"
    )

export const transformObjectIntoStyleString = (object: Record<"string", string | number>) => Object.entries(object).reduce(
    (carry, [key, value]) => `${carry}${toLowercaseWithDashes(key)}:${value}`, "");

