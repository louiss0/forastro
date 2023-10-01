export type HasForEachMethod = {
    forEach<T>(callbackfn: (...args: Array<any>) => T, thisArg?: typeof globalThis): void;
}

export type Callback = (...args: Array<unknown>) => any


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


