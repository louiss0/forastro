export type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T> = T extends HasForEachMethod
	? Parameters<T["forEach"]>[0] : T extends Generator
	? <U>(value: ReturnType<T["next"]>["value"])=> U : <V>(value:unknown)=> V


export type HasForEachMethod = {
	forEach(callbackfn: (...args:Array<unknown>) => void, thisArg?: typeof  globalThis): void;
}

function* range(start:number,stop:number,step=1) {
    

    let count = start

    while (count < stop) {
        
        yield count

        count += step
    }



}


async function* iterate<T extends HasForEachMethod >(iterable:T, cb:GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T>) {
    

    for await (const [key, value] of Object.entries(iterable)) {
        

        yield  cb(key, value, iterable)

    }


}


export {range, iterate}