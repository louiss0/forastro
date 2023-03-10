
const switchStateSymbol = Symbol.for("switch-state")



const cases:Array<Case<unknown>> = []

const windowWithSwitchState =  Object.assign(globalThis, {[switchStateSymbol]: cases })

function  getCaseFromSwitchState() {
    

    return windowWithSwitchState[switchStateSymbol].at(-1)

}

function  setCaseInSwitchState<T>(value:T) {


    return windowWithSwitchState[switchStateSymbol].push(new Case(value))


}

function  unsetCaseInSwitchState() {


    return windowWithSwitchState[switchStateSymbol].pop()


}



class Case<T> {

    constructor(
        public readonly value: T,

    ) {
        
    }
}

export {getCaseFromSwitchState, setCaseInSwitchState, unsetCaseInSwitchState, Case,} 