type HasForEachMethod = {
    forEach<T>(callbackfn: (...args:Array<unknown>) => T, thisArg?: typeof  globalThis): void;
}


type GetParametersFromIterableWithAForEachMethod<T extends HasForEachMethod> = Parameters<Parameters<T["forEach"]>[0] >

type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U> =
    T extends HasForEachMethod
    ? (value: GetParametersFromIterableWithAForEachMethod<T>[0], key: GetParametersFromIterableWithAForEachMethod<T>[1], info: IterationInfo) => U
    : T extends Generator
    ? (value: ReturnType<T["next"]>["value"]) => U
    : never

type IterateRangeOptions = {
    start:number
    stop:number
    step?:number
}

class IterationInfo {

    constructor(
        private readonly firstIterationNum:number,
        private readonly iterationNum:number,
        private readonly lastIterationNum:number,

    ) {
        
    }

    get count() {
        
        return this.lastIterationNum - this.firstIterationNum

    }

    get iteration() {

        return this.iterationNum  + 1
    }

    get isFirst() {
        return this.firstIterationNum === this.iterationNum
    }

    get isLast() {
        return this.lastIterationNum === this.iterationNum
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

type IterateRangeCallback<U> = (value:number, info:IterationInfo) => U 

export type {
    HasForEachMethod,
    GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed,
    IterateRangeOptions,
    IterateRangeCallback
}

export {IterationInfo}