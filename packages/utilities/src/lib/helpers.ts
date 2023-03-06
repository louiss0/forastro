import type { GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed, HasForEachMethod } from "./types"

const isIterable = (value:unknown):value is Iterable<unknown> =>
    isObject(value) && (
        typeof value[Symbol.iterator] === 'function'
        || typeof value[Symbol.asyncIterator] === 'function'
    )    

const GeneratorFunction = function* () {}.constructor as GeneratorFunctionConstructor

const AsyncGeneratorFunction = async function* () {}.constructor as AsyncGeneratorFunctionConstructor


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

function* reverseRange(start:number,stop:number,step=1) {
    

    let count = start

    while (count > stop) {
        
        yield count

        count -= step
    }



}



function isGenerator(value:unknown): value is Generator<unknown> {


    return value instanceof Function && value.prototype === GeneratorFunction.prototype  
    

}


function isAsyncGenerator(value:unknown): value is AsyncGenerator<unknown> {


    return value instanceof Function && value.prototype === AsyncGeneratorFunction.prototype  
}

async function* iterate<T extends Iterable<unknown>>(iterable:T, cb:GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T>) {
    


    if (isIterable(iterable) && hasForEachMethod(iterable)) {
        
        
        for await (const [key, value] of Object.entries(iterable)) {
            
            
            yield  cb(value, key, iterable)
            
        }
        
    }
    
    if (isGenerator(iterable) || isAsyncGenerator(iterable)) {
        

        for await (const value of iterable) {
            
            
            yield  cb(value)
            
        }

    }



}

export type {GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed}

export {range, iterate, reverseRange, isIterable }