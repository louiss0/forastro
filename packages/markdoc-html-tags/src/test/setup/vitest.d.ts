import type {
    ToEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRightFunctionType,
    ToEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRightFunctionType
} from "src/test/setup";


declare module "vitest" {

    interface CustomMatchers<T extends unknown> {
        toEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRight(
            type: Parameters<ToEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRightFunctionType>[1]
        ): T

        toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight(
            message: Parameters<ToEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRightFunctionType>[1]
        ): T

    }

    interface Assertion<T = unknown> extends CustomMatchers<T> { }

}