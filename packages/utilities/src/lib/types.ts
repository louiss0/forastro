type HasForEachMethod = {
    forEach<T>(callbackfn: (...args: Array<any>) => T, thisArg?: typeof globalThis): void;
}


type GetParametersFromIterableWithAForEachMethod<T extends HasForEachMethod> = Parameters<Parameters<T["forEach"]>[0]>

type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U> =
    T extends HasForEachMethod
    ? (
        value: GetParametersFromIterableWithAForEachMethod<T>[0],
        info: IterationInfo,
        key: GetParametersFromIterableWithAForEachMethod<T>[1]
    ) => U
    : T extends Generator
    ? (value: ReturnType<T["next"]>["value"]) => U
    : never

type IterateRangeCallback<U> = (value: number, info: IterationInfo) => U

type IterateRangeOptions = {
    start: number
    stop: number
    step?: number
}

class IterationInfo {

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


export type {
    HasForEachMethod,
    GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed,
    IterateRangeOptions,
    IterateRangeCallback
}

export { IterationInfo }