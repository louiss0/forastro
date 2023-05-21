import type {
    GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed,
    HasForEachMethod,
    IterateRangeCallback,
    IterateRangeOptions,
} from "./types"
import { IterationInfo } from "./types"


const isIterable = (value: unknown): value is Iterable<unknown> =>
    isObject(value) && (
        typeof value[Symbol.iterator] === 'function'
        || typeof value[Symbol.asyncIterator] === 'function'
    )

type Callback = (...args: Array<unknown>) => any

function executeIf<T extends Callback>(condition: boolean, cb: T): ReturnType<T> | null {


    return condition ? cb() : null

}

function executeUnless<T extends Callback>(condition: boolean, cb: T) {


    return executeIf(!condition, cb)

}


function isObject(value: unknown): value is Record<PropertyKey, unknown> {

    return typeof value === "object" && value != null
}

export function hasForEachMethod(value: unknown): value is HasForEachMethod {
    return isObject(value) && 'forEach' in value
}




function* range(start: number, stop: number, step = 1) {


    if (start === stop) {


        throw new Error("Start can't be the same as stop")
    }


    if (step === 0) {



        throw new Error("Step can't be zero pick a negative or positive number")


    }

    const numIsNegative = Math.sign(step) === -1
    const numIsPositive = Math.sign(step) === 1

    const startIsGreaterThanStopAndStepIsPositive = start > stop && numIsPositive

    if (startIsGreaterThanStopAndStepIsPositive) {


        throw new Error("If you want start to be greater than stop please make step negative")

    }


    const stopIsGreaterThanStartAndStepIsNegative = start < stop && numIsNegative

    if (stopIsGreaterThanStartAndStepIsNegative) {


        throw new Error("If you want start to be less than stop please make step positive")

    }




    let count = start


    if (numIsPositive) {



        while (count < stop) {



            yield count

            count += step
        }

        return
    }



    if (numIsNegative) {


        while (count > stop) {



            yield count

            count += step
        }

    }



}









function isGenerator(value: unknown): value is Generator {


    return isIterable(value) && value.toString() === "[object Generator]"

}



function wrapFunctionInAsyncGenerator<T extends (...args: Array<any>) => ReturnType<T>>(fn: T) {


    return async function* (...args: Parameters<T>) {

        const res = fn(...args)


        if (res instanceof Promise) {

            yield await res


            return
        }

        yield res


    }

}

async function* iterate<T extends Iterable<unknown> | Generator, U>(iterable: T,
    cb: GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U>) {


    if (!isIterable(iterable)) {

        throw new Error("You did not pass in an iterable")
    }



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


export function* generateIterationInfoForIterablesThatAreNotGenerators<T extends Iterable<any> & HasForEachMethod>(iterable: T) {


    const firstIterationNumber = 0

    type ParametersOfIterable = Parameters<Parameters<typeof iterable["forEach"]>[0]>

    const iterableEntriesMap: Map<ParametersOfIterable[1], ParametersOfIterable[0]> = new Map()

    let iteration = firstIterationNumber


    iterable.forEach((value, key) => iterableEntriesMap.set(key, value))


    const iterableEntriesMapLength = iterableEntriesMap.size

    for (const [key, value] of iterableEntriesMap) {




        yield {
            value,
            info: new IterationInfo(
                firstIterationNumber,
                iteration,
                iterableEntriesMapLength
            ),
            key
        }

        iteration++


    }



}




function* syncIterate<T extends Iterable<unknown> | Generator, U>(iterable: T,
    cb: GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U>) {


    if (!isIterable(iterable)) {


        throw new Error("You did not pass in an iterable")
    }





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

async function* iterateRange<U>(callback: IterateRangeCallback<U>, options: IterateRangeOptions) {

    const { start, stop, step = 1 } = options


    yield* iterate(
        range(start, stop, step),
        (val: number | void) =>
            callback(
                val as number,
                new IterationInfo(start, val as number, stop
                )
            )
    )

}

const templateMapSymbol = Symbol("template-map");


type AstroRenderSlotFunction<U extends Array<any>> = <T extends Lowercase<string>>(slotName: T, args: U) => Promise<string>


type ContextCurryRenderSlotFunction = <U extends Array<any>>(...args: U) => ReturnType<AstroRenderSlotFunction<U>>


type TemplateMapObject = {
    [templateMapSymbol]: Map<Lowercase<string>, ContextCurryRenderSlotFunction>
}




function defineGlobalTemplateMap() {



    if (templateMapSymbol in globalThis) { return };


    Object.assign(globalThis, {
        [templateMapSymbol]: new Map<Lowercase<string>, ContextCurryRenderSlotFunction>(),
    })
}



function getGlobalTemplateMap() {

    return (globalThis as unknown as TemplateMapObject)[templateMapSymbol]

}

function setToGlobalTemplateMap(templateName: Lowercase<string>, astroRenderFunction: ContextCurryRenderSlotFunction) {


    return getGlobalTemplateMap().set(templateName, astroRenderFunction)


}

function getFromGlobalTemplateMap(templateName: Lowercase<string>) {

    return getGlobalTemplateMap().get(templateName)

}






export {
    range,
    iterate,
    iterateRange,
    isIterable,
    executeIf,
    syncIterate,
    executeUnless,
    defineGlobalTemplateMap,
    setToGlobalTemplateMap,
    getFromGlobalTemplateMap
}