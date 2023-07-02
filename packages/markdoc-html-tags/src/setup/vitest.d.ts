import type { Assertion, } from 'vitest'

declare module "vitest" {

    interface CustomMatchers<T extends unknown> {
        toEqualMarkdocErrorObject(): T
        toEqualMarkdocErrorObjectThatTellsTheUserThatATypeIsNotRight(): T
        toEqualMarkdocErrorObjectThatTellsTheUserValueIsNotRight(): T

    }

    interface Assertion<T = unknown> extends CustomMatchers<T> { }

}