import { isObject } from "../internal"
import type { Callback } from "../types"


export function executeIf<T extends Callback>(condition: boolean, cb: T): ReturnType<T> | null {


    return condition ? cb() : null

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

    if (isObject(firstParam)) {

        const { condition, ifCb, elseCb } = firstParam

        return condition ? ifCb() : elseCb()

    }


    return firstParam ? secondParam?.() : thirdParam?.()





}



export function executeUnless<T extends Callback>(condition: boolean, cb: T) {


    return executeIf(!condition, cb)

}

export function throwIf(condition: boolean, message = "Something went wrong"): asserts condition is false {


    executeIf(condition, () => {
        throw new Error(message,)
    })


}


export function throwUnless(condition: boolean, message = "Something went wrong"): asserts condition {

    throwIf(!condition, message,)

}
