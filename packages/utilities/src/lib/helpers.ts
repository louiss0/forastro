import {
    GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed,
    HasForEachMethod,
    IterateRangeCallback,
    IterateRangeOptions,
    IterationInfo
} from "./types"


const isIterable = (value: unknown): value is Iterable<unknown> =>
    isObject(value) && (
        typeof value[Symbol.iterator] === 'function'
        || typeof value[Symbol.asyncIterator] === 'function'
    )    

type Callback = (...args:Array<unknown>)=> any

function executeIf<T extends Callback>(condition:boolean, cb:T):ReturnType<T> | null  {


    return condition ? cb() : null

}

function executeUnless<T extends Callback>(condition:boolean, cb:T) {


    return executeIf(!condition, cb)

}


function isObject(value:unknown): value is Record<PropertyKey, unknown> {

    return typeof value === "object" && value != null
}

 function hasForEachMethod(value:unknown): value is HasForEachMethod {
	return  isObject(value) && 'forEach' in value
}



function* range(start:number,stop:number,step=1) {
    

    if (start === stop) {
        
        throw new Error("Start can't be the same as stop")
    }
    
    if (step === 0) {
        

        throw new Error("Step can't be zero pick a negative or positive number")


    }

    const numIsNegative = Math.sign(step) === -1
    const numIsPositive =Math.sign(step) === 1

    const startIsGreaterThanStopAndStepIsPositive = start> stop && numIsPositive

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



function wrapFunctionInAsyncGenerator<T extends (...args:Array<any>)=> ReturnType<T>>(fn: T) {

    return  async function* (...args:Parameters<T>) {
        
        const res = fn(...args)
        
        if (res instanceof Promise) {
            yield await res
            
            return
        }

        yield res
    
    }
}


async function* iterate<T extends Generator | HasForEachMethod, U>(
    iterable: T, cb:GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U>) {
    

    if (!isIterable(iterable)) {
        
        throw new Error("You did not pass in an iterable")
    }

    
    
    if (hasForEachMethod(iterable)) {
       

        const entries = new Map()

        iterable.forEach((value, index)=> entries.set(index,value))



        let iteration = 0

        for await (const [key, value] of entries) {
            iteration = Array.isArray(iterable) ? key as number : iteration + 1  
            
            yield* wrapFunctionInAsyncGenerator(cb as GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<HasForEachMethod, U>)
                (value, key, new IterationInfo(0, iteration, entries.size))
            
        }





        return
    }


    if (isGenerator(iterable)) {
        
        for (const value of iterable) {

            yield* wrapFunctionInAsyncGenerator(cb as GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<Generator, U>)(value)
        }

    }

   
    

}




async function* iterateRange<T>(callback:IterateRangeCallback<T>, options:IterateRangeOptions) {
    
    const { start, stop, step = 1 } = options

    yield* iterate(range(start, stop, step), (val)=> callback(val as number, new IterationInfo(start, val as number, stop)) )

}



export {range, iterate, iterateRange, isIterable, executeIf, executeUnless }