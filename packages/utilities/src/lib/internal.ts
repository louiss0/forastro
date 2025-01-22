/* eslint-disable @typescript-eslint/no-explicit-any */

export type HasForEachMethod = {
    forEach<T>(callbackfn: (...args: Array<any>) => T, thisArg?: typeof globalThis): void;
}

export type Callback = (...args: Array<any>) => any


type GetParametersFromIterableWithAForEachMethod<T extends HasForEachMethod> = Parameters<Parameters<T["forEach"]>[0]>

export type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U> =
    T extends HasForEachMethod
    ? (
        value: GetParametersFromIterableWithAForEachMethod<T>[0],
        info: IterationInfo,
        key: GetParametersFromIterableWithAForEachMethod<T>[1]
    ) => U
    : T extends Generator
    ? (value: ReturnType<T["next"]>["value"]) => U
    : never

export type IterateRangeCallback<U> = (value: number, info: IterationInfo) => U

export type IterateRangeOptions = {
    start: number
    stop: number
    step?: number
    inclusive?: true
}


export class IterationInfo {

    constructor (
        private readonly firstIterationNum: number,
        private readonly iterationNum: number,
        private readonly lastIterationNum: number,

    ) {

    }

    get count() {

        return this.lastIterationNum - this.firstIterationNum

    }

    get iteration() {

        return this.iterationNum + 1
    }

    get isFirst() {
        return this.firstIterationNum === this.iterationNum
    }

    get isLast() {
        return this.lastIterationNum === this.iteration
    }

    get isEven() {
        return this.iterationNum % 2 === 0

    }

    get isOdd() {
        return this.iterationNum % 2 !== 0

    }
    get remaining() {

        return this.lastIterationNum - this.iteration

    }


}




export function* generateIterationInfoForIterablesThatAreNotGenerators<T extends Iterable<unknown> & HasForEachMethod>(iterable: T) {


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

export const isIterable = (value: unknown): value is Iterable<unknown> =>
    isObject(value) && (
        typeof value[Symbol.iterator] === 'function'
        || typeof value[Symbol.asyncIterator] === 'function'
    )


export function isObject(value: unknown): value is Record<PropertyKey, unknown> {

    return typeof value === "object" && value != null
}

export function isGenerator(value: unknown): value is Generator {


    return isIterable(value) && value.toString() === "[object Generator]"

}



export function wrapFunctionInAsyncGenerator<T extends (...args: Array<any>) => ReturnType<T>>(fn: T) {


    return async function* (...args: Parameters<T>) {

        const res = fn(...args)


        if (res instanceof Promise) {

            yield await res


            return
        }

        yield res


    }

}

export function hasForEachMethod(value: unknown): value is HasForEachMethod {
    return isObject(value) && 'forEach' in value
}

