
const switchStateSymbol = Symbol.for("switch-state")



const cases:Array<Case<unknown>> = []

const windowWithSwitchState =  Object.assign(globalThis, {[switchStateSymbol]: cases })

function  getCaseFromSwitchState() {
    

    return windowWithSwitchState[switchStateSymbol].at(-1)

}

function  setCaseInSwitchState<T>(value:T, cloak:boolean) {


    return windowWithSwitchState[switchStateSymbol].push(new Case(value, cloak))


}

function  unsetCaseInSwitchState() {


    return windowWithSwitchState[switchStateSymbol].pop()


}

class Case<T> {

    #isFound: true | null= null
    constructor(
        public readonly value: T,
        public readonly cloak: boolean,

    ) {
        
    }

    get isFound() {
        
        return this.#isFound
    }
    setIsFoundToTrue() {

        this.#isFound = true

        return this
    }

}

export {getCaseFromSwitchState, setCaseInSwitchState, unsetCaseInSwitchState, Case,} 