<<<<<<< HEAD:packages/flow/test/helpers.test.ts
import { describe, expect, it, } from "vitest";
=======
>>>>>>> main:packages/flow/src/test/helpers.test.ts
import {
    Case, getCaseFromSwitchState, setCaseInSwitchState, unsetCaseInSwitchState
} from "packages/flow/src/helpers";


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


<<<<<<< HEAD:packages/flow/test/helpers.test.ts
        expect(setCaseInSwitchState(null)).toBe(1)
=======
        expect(setCaseInSwitchState(null, false)).toBe(1)
>>>>>>> main:packages/flow/src/test/helpers.test.ts


        expect(switchStateSymbol in globalThis).toBe(true)


    })

})


