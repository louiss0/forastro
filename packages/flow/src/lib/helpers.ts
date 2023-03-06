
const switchStateSymbol = Symbol.for("switch-state")


const isEven = (num:number) =>  num % 2 === 0

const isOdd = (num:number) =>  num % 2 !== 0



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

class IterationInfo {

    constructor(
        private readonly firstIterationNum:number,
        private readonly iterationNum:number,
        private readonly lastIterationNum:number,

    ) {
        
    }

    get isFirst() {

        return this.firstIterationNum === this.iterationNum
    }
    get isLast() {
        return this.lastIterationNum === this.iterationNum
    }
    get isEven() {
        return isEven(this.iterationNum)
        
    }
    
    get isOdd() {
        return isOdd(this.iterationNum)

    }
    get remaining() {

        return this.lastIterationNum - this.iterationNum

    }


}

class Case<T> {

    constructor(
        public readonly value: T,

    ) {
        
    }
}

export {getCaseFromSwitchState, setCaseInSwitchState, unsetCaseInSwitchState, Case , IterationInfo } 