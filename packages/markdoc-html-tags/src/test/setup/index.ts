import { generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight, generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight } from 'src/utils';
import { expect, } from 'vitest';


type AllowedMarkdocTypesAsStrings = "string" | "number" | "array" | "boolean" | "object"

export type ToEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRightFunctionType =
    typeof matchersObject["toEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRight"]

export type ToEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRightFunctionType =
    typeof matchersObject["toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight"]

const markdocErrorObjectStructure = {
    id: "invalid-",
    level: "",
    message: "",
    location: {
        file: "",
        start: {
            line: 0,
            character: 0
        },
        end: {
            line: 0,
            character: 0
        }
    }
}



const matchersObject = {


    toEqualMarkdocErrorObject(received: unknown,) {


        const receivedIsAViableErrorObject =
            Object.keys(markdocErrorObjectStructure).reduce((errorMessage, key) => {

                if (typeof received !== "object" || typeof received === "object" && received == null) {

                    return `This is not an object please provide an object`

                }

                if (key === "location") {

                    const locationObject = received[key as keyof typeof received]

                    return Object.entries(locationObject)
                        .reduce((locationErrorMessage, [key, value]) => {

                            if (!Object.hasOwn(locationObject, key))
                                return `${errorMessage}${locationErrorMessage} This ${key} is missing`

                            if (key === "file" && typeof value !== "string")
                                return `${errorMessage} This ${key} must be a string`

                            // TODO: fINSH condition for location.
                            // const locationK
                            // if (.includes(key) && typeof value !== "object") {

                            //     return `${errorMessage}${locationErrorMessage} ${key} must have an object with line and character as keys`
                            // }



                        }, "")

                }



                return !Object.hasOwn(received, key)
                    ? `${errorMessage} The ${key} is missing,`
                    : typeof received[key as keyof typeof received] !== "string"
                        ? `${errorMessage}${key} is not a string`
                        : errorMessage



            }, "")


        return Object.is(received, markdocErrorObjectStructure)
            ? {
                pass: true,
                expected: received,
                actual: received,
                message: () => `Received ${this.utils.printReceived(
                    markdocErrorObjectStructure
                )} is equal to ${this.utils.printExpected(markdocErrorObjectStructure)}`,
            }
            : {
                pass: false,
                actual: received,
                expected: markdocErrorObjectStructure,
                message: () =>
                    `Expected ${this.utils.printExpected(received)} to equal ${this.utils.printReceived(markdocErrorObjectStructure)}`,
            }

    },

    toEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRight(received: unknown, expected: AllowedMarkdocTypesAsStrings) {

        const markdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight =
            generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight(
                expected
            )
        const receivedValueHasSameStructureAsMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight = this.equals(
            received,
            markdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight
        )

        return receivedValueHasSameStructureAsMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight
            ? {
                pass: true,
                message: () => this.utils.printExpected(markdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight),
                actual: received,
                expected: markdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight,

            }
            : {
                pass: false,
                message: () => this.utils.printReceived(received),
                actual: received,
                expected: received,
            }

    },


    toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight(
        received: unknown,
        expected: string) {

        const markdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight =
            generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight(
                expected
            )

        const receivedValueHasSameStructureMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight =
            this.equals(
                received,
                markdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight
            )

        return receivedValueHasSameStructureMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight
            ? {
                pass: true,
                message: () => this.utils.printExpected(markdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight),
                actual: received,
                expected: markdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight,

            }
            : {
                pass: false,
                message: () => this.utils.printReceived(received),
                actual: received,
                expected: received,
            }
    },



} satisfies Parameters<typeof expect.extend>[0]


expect.extend(matchersObject)


