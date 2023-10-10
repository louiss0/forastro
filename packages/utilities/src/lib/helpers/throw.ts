import { executeIf } from "./conditional"

export async function returnErrorAndResultFromPromise<T extends Promise<any>>(promise: T) {



    try {

        return [await promise, null] as const


    } catch (error) {


        if (error instanceof Error) {

            return [null, error] as const

        }

        if (typeof error === "string") {

            return [null, new Error(error, { cause: "Failed Promise" })] as const

        }

        if (typeof error === "object") {


            return [null, new Error(JSON.stringify(error, null, 2))] as const

        }




        return [null, new Error("Something went wrong", { cause: "Failed Promise" })] as const





    }



};



export function throwIf(condition: boolean, message = "Something went wrong", cause?: unknown): asserts condition is false {


    executeIf(condition, () => {
        throw new Error(message, { cause })
    })


}


export function throwUnless(condition: boolean, message = "Something went wrong", cause?: unknown): asserts condition {

    throwIf(!condition, message, cause)

}