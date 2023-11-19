
import { createAstroFunctionalComponent, } from './helpers';
import { executeIfElse, throwIf, throwUnless } from './helpers/conditional';



let callCount = 0


export const useTemplaterAndProjector = (debugName) => {


    let storedSlot

    let templaterProps

    callCount++

    const Templater = createAstroFunctionalComponent((props, slots) => {



        throwUnless(
            typeof slots.default === "function",
            "Please pass a Child into this component",
            `Templater${debugName?.toUppercase() ?? callCount} Invalid Child`
        )


        storedSlot = slots.default

        templaterProps = Object.freeze(props)

    })



    const Projector = createAstroFunctionalComponent((props, slots) => {

        const defineTemplatePropsHasNoKeys = Object.keys(templaterProps).length !== 0;

        const theProjectorSlotFirstExpressionIsNotAFunctionButTheDefineTemplateContextHasProps =
            typeof projectorSlotFirstExpression !== "function"
            && defineTemplatePropsHasNoKeys;


        throwIf(
            theProjectorSlotFirstExpressionIsNotAFunctionButTheDefineTemplateContextHasProps,
            "You must pass in a function as the child if the templater has props",
            `Projector${debugName?.toUppercase() ?? callCount} Invalid Child`
        )



        const storedSlotResult = storedSlot()

        const storedSlotFirstExpression = storedSlotResult.expressions.at(0)


        const projectorPropsHasNoKeys = Object.keys(props).length !== 0;


        return executeIfElse(
            typeof storedSlotFirstExpression === "function",
            () => executeIfElse(
                projectorPropsHasNoKeys,
                () => storedSlotFirstExpression(
                    Object.freeze(props),
                    slots
                ),
                () => storedSlotFirstExpression(slots)
            ),
            storedSlot
        )





    })




    return [Templater, Projector]


}