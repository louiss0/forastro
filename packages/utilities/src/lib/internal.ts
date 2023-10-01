import { IterationInfo, type HasForEachMethod } from "packages/utilities/src/lib/types"

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