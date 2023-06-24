import { describe, expect, it, } from "vitest";
import { Case, getCaseFromSwitchState, setCaseInSwitchState, unsetCaseInSwitchState } from "./helpers";


const switchStateSymbol = Symbol.for("switch-state")



describe("getGlobalState", () => {



    it('returns undefined if there is no state', () => {


        expect(getCaseFromSwitchState()).toBeUndefined()

    })


    it("returns the state after it is set", () => {

        setCaseInSwitchState(null, true)


        expect(getCaseFromSwitchState()).toBeInstanceOf(Case)



    })


})

describe("unsetCaseInSwitchState ", () => {

    it("empties all cases", () => {

        expect(unsetCaseInSwitchState()).toBeInstanceOf(Case)

        expect(getCaseFromSwitchState()).toBeUndefined()

    })

})

describe("setCaseInSwitchState", () => {



    it('sets the case in  global state', () => {


        expect(setCaseInSwitchState(null)).toBe(1)


        expect(switchStateSymbol in globalThis).toBe(true)


    })

})


