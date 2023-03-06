import type { GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed, HasForEachMethod } from "./types"

const isIterable = (value:unknown):value is Iterable<unknown> =>
    isObject(value) && (
        typeof value[Symbol.iterator] === 'function'
        || typeof value[Symbol.asyncIterator] === 'function'
    )    

const GeneratorFunction = function* () {}.constructor as GeneratorFunctionConstructor

//const AsyncGeneratorFunction = async function* () {}.constructor as AsyncGeneratorFunctionConstructor


function isObject(value:unknown): value is Record<PropertyKey, unknown> {

    return typeof value === "object" && value != null
}

 function hasForEachMethod(value:unknown): value is HasForEachMethod {
	return  isObject(value) && 'forEach' in value
}



function* range(start:number,stop:number,step=1) {
    

    let count = start

    while (count < stop) {
        
        yield count

        count += step
    }



}


const r = range


function* reverseRange(start:number,stop:number,step=1) {
    

    let count = start

    while (count > stop) {
        
        yield count

        count -= step
    }



}



function isGenerator(value: unknown): value is Generator {


    return isIterable(value) && value.toString() === "[object Generator]"

}

function wrapFunctionInAsyncGenerator(fn:(...args:Array<unknown>)=>unknown) {

    return  async function* (...args:Array<unknown>) {
        
        yield await fn(...args)
    }
}


async function* iterate<T extends Iterable<unknown>>(iterable:T, cb:GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T>) {
    

    const wrappedFunction = wrapFunctionInAsyncGenerator(cb)


    if (isIterable(iterable) && hasForEachMethod(iterable)) {
        
        
        for await (const [key, value] of Object.entries(iterable)) {
            
            
            yield*  wrappedFunction(value, key, iterable)
            
        }

        return
    }
    
    
    for await (const value of iterable) {

   
       yield* wrappedFunction(value)  
   
   }
  
    //  if (isGenerator(iterable)) {
        
       

    // }
    
    
    
    
        
        





}

export type {GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed}

export {range, iterate, reverseRange, isIterable, isGenerator,  }