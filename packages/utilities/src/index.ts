
export { useTemplaterAndProjector } from "./lib/useTemplaterAndProjector.js"
export * from "./lib/types"
import type { Props, SSRResult } from "astro"
import { isObject } from "./lib/internal.js"
import { generateIterationInfoForIterablesThatAreNotGenerators, hasForEachMethod, isGenerator, isIterable, wrapFunctionInAsyncGenerator } from "./lib/internal.js"
import { IterationInfo, type Callback, type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed, type HasForEachMethod, type IterateRangeCallback, type IterateRangeOptions } from "./lib/types"



export function executeIf<T extends Callback>(condition: unknown, cb: T): ReturnType<T> | undefined {


    return condition ? cb() : undefined


}


type IfElseOptions = {
    condition: boolean
    ifCb: () => NonNullable<unknown>
    elseCb: () => NonNullable<unknown>
}

export function executeIfElse(options: IfElseOptions):
    ReturnType<typeof options.ifCb> | ReturnType<typeof options.elseCb>

export function executeIfElse(condition: boolean, ifCb: IfElseOptions["ifCb"], elseCb: IfElseOptions["elseCb"]):
    ReturnType<typeof ifCb> | ReturnType<typeof elseCb>

export function executeIfElse(
    firstParam: boolean | IfElseOptions,
    secondParam?: Callback,
    thirdParam?: Callback
) {

    function valueIsIfElseOptions(value: unknown): value is IfElseOptions {

        const potentialKeys = ["ifCb", "elseCb", "condition"]

        return isObject(value)
            && potentialKeys.length === Object.keys(value).length
            && potentialKeys.every(potentialKey => potentialKey in value)
    }

    if (valueIsIfElseOptions(firstParam) && !secondParam && !thirdParam) {

        const { condition, ifCb, elseCb } = firstParam

        return condition ? ifCb() : elseCb()

    }

    return firstParam ? secondParam?.() : thirdParam?.()


}



export function executeUnless<T extends Callback>(condition: unknown, cb: T): asserts condition {

    return executeIf(!condition, cb)

}

export function throwIf(condition: unknown, message = "Condition is false") {

    executeIf(
        condition,
        () => {
            throw new Error(message,)
        }
    )


}


export function throwUnless(condition: boolean, message = "Condition is true"): asserts condition {

    throwIf(!condition, message,)

}


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


export async function returnErrorAndResultFromPromise<T extends Promise<unknown>>(promise: T) {



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

