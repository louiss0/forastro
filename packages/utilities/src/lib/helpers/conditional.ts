import { isObject } from "../internal"
import type { Callback } from "../types"



export function executeIf<T extends Callback>(condition: unknown, cb: T): ReturnType<T> | undefined {


    return condition ? cb() : undefined


}


type IfElseOptions = {
    condition: boolean
    ifCb: () => NonNullable<unknown>
    elseCb: () => NonNullable<unknown>
}

export function executeIfElse(options: IfElseOptions):
    ReturnType<typeof options.ifCb> | ReturnType<typeof options.elseCb>

export function executeIfElse(condition: boolean, ifCb: IfElseOptions["ifCb"], elseCb: IfElseOptions["elseCb"]):
    ReturnType<typeof ifCb> | ReturnType<typeof elseCb>

export function executeIfElse(
    firstParam: boolean | IfElseOptions,
    secondParam?: Callback,
    thirdParam?: Callback
) {

    function valueIsIfElseOptions(value: unknown): value is IfElseOptions {

        const potentialKeys = ["ifCb", "elseCb", "condition"]

        return isObject(value)
            && potentialKeys.length === Object.keys(value).length
            && potentialKeys.every(potentialKey => potentialKey in value)
    }

    if (valueIsIfElseOptions(firstParam) && !secondParam && !thirdParam) {

        const { condition, ifCb, elseCb } = firstParam

        return condition ? ifCb() : elseCb()

    }

    return firstParam ? secondParam?.() : thirdParam?.()


}



export function executeUnless<T extends Callback>(condition: unknown, cb: T): asserts condition {

    return executeIf(!condition, cb)

}


export function throwIf(condition: unknown, message = "Condition is false") {

    executeIf(
        condition,
        () => {
            throw new Error(message,)
        }
    )


}


export function throwUnless(condition: boolean, message = "Condition is true"): asserts condition {

    throwIf(!condition, message,)

}
