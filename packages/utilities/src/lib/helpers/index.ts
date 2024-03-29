import type { Props, SSRResult, } from "astro"

import { IterationInfo, type Callback, type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed, type HasForEachMethod, type IterateRangeCallback, type IterateRangeOptions } from "../types"
import {
    generateIterationInfoForIterablesThatAreNotGenerators, hasForEachMethod, isGenerator, isIterable, wrapFunctionInAsyncGenerator
} from "../internal"


import { throwUnless, throwIf } from "./conditional"

interface TemplateStringsArray extends ReadonlyArray<string> {
    readonly raw: readonly string[];
}

type RenderTemplateResult = Readonly<{
    htmlParts: TemplateStringsArray
    expressions: Array<unknown>
    error: Error
}>

export const createMarkdocFunction = (cb: Callback) => {

    return {
        transform(parameters: Record<number, unknown>) {

            return cb(...Object.values(parameters))

        }
    }

};








type RangeOptions = { step?: number, inclusive?: true }

export function* range(start: number, stop: number, options: RangeOptions = {}) {


    const { step = 1, inclusive } = options


    throwIf(start === stop, "Start can't be the same as stop")

    throwIf(step <= 0, "Step can't be zero or a negative number")



    if (start > stop) {

        let i = start

        if (inclusive) {

            while (i >= stop) {


                yield i

                i -= step

            }

            return

        }

        while (i > stop) {


            yield i

            i -= step
        }

        return

    }

    if (start < stop) {

        let i = start

        if (inclusive) {

            while (i <= stop) {


                yield i

                i += step

            }

            return

        }

        while (i < stop) {

            yield i

            i += step

        }

    }


}











export async function* iterate<T extends Iterable<unknown> | Generator, U>(iterable: T,
    cb: GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U>) {



    throwUnless(isIterable(iterable), "You did not pass in an iterable")




    if (hasForEachMethod(iterable)) {


        for (const { value, info, key } of generateIterationInfoForIterablesThatAreNotGenerators(iterable)) {




            yield* wrapFunctionInAsyncGenerator<
                GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<
                    HasForEachMethod,
                    U>
            >(cb)
                (value, info, key)

        }





        return
    }


    if (isGenerator(iterable)) {

        for (const value of iterable) {

            yield* wrapFunctionInAsyncGenerator<
                GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<
                    Generator, U
                >
            >(cb)
                (value)
        }

    }





}







export function* syncIterate<T extends Iterable<unknown> | Generator, U>(iterable: T,
    cb: GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U>) {



    throwUnless(isIterable(iterable), "You did not pass in an iterable")





    if (hasForEachMethod(iterable)) {


        for (const { value, info, key } of generateIterationInfoForIterablesThatAreNotGenerators(iterable)) {




            yield (
                cb as GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<HasForEachMethod, U>
            )(
                value,
                info,
                key
            )

        }





        return
    }


    if (isGenerator(iterable)) {


        for (const value of iterable) {

            yield cb(value)
        }

    }



}

export async function* iterateRange<U>(callback: IterateRangeCallback<U>, options: IterateRangeOptions) {

    const { start, stop, step = 1, inclusive } = options


    yield* iterate(
        range(start, stop, { step, inclusive }),
        (val) =>
            callback(
                val as number,
                new IterationInfo(start, val as number, stop
                )
            )
    )

}



type SlotFunction = ((...args: Array<NonNullable<unknown>>) => RenderTemplateResult) | undefined


type MaybePromise<T extends NonNullable<unknown>> = T | Promise<T>

type AstroRenderFunction = (
    props: Props,
    slots: Record<string, SlotFunction>
) => MaybePromise<string | number | RenderTemplateResult>


export const createAstroFunctionalComponent = (fn: AstroRenderFunction) =>
    Object.assign((result: SSRResult, props: Props, slots: Record<string, SlotFunction>) => {

        return {
            ...result,
            [Symbol.toStringTag]: 'AstroComponent',
            async *[Symbol.asyncIterator]() {

                yield* wrapFunctionInAsyncGenerator(fn)(props, slots)

            }
        }
    },
        { isAstroComponentFactory: true }
    )


export async function returnErrorAndResultFromPromise<T extends Promise<any>>(promise: T) {



    try {

        return [await promise, null] as const


    } catch (error) {


        if (error instanceof Error) {

            return [null, error] as const

        }

        if (typeof error === "string") {

            return [null, new Error(error)] as const

        }

        if (typeof error === "object") {


            return [null, new Error(JSON.stringify(error, null, 2))] as const

        }




        return [null, new Error("Something went wrong",)] as const





    }



};

