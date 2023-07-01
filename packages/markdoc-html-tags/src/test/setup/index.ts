import { generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserATypeIsNotRight, generateMarkdocErrorObjectThatHasAMessageThatTellsTheUserAValueIsNotRight } from 'src/utils';
import { expect, } from 'vitest';


type AllowedMarkdocTypesAsStrings = "string" | "number" | "array" | "boolean" | "object"

export type ToEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRightFunctionType =
    typeof matchersObject["toEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRight"]

export type ToEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRightFunctionType =
    typeof matchersObject["toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight"]

const matchersObject = {

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


