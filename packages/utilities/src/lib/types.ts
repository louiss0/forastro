type HasForEachMethod = {
    forEach<T>(callbackfn: (...args:Array<unknown>) => T, thisArg?: typeof  globalThis): void;
}

type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T> =
    T extends HasForEachMethod
	? Parameters<T["forEach"]>[0] : T extends Generator
    ? (value: ReturnType<T["next"]>["value"]) => unknown
    : (...args: Array<unknown>) => unknown


export type {HasForEachMethod, GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed}