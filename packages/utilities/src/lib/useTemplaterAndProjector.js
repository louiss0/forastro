
import { createAstroFunctionalComponent, } from './helpers';
import { executeIf, executeIfElse, throwIf, throwUnless } from './helpers/conditional';
import { isObject, } from './internal';



let callCount = 0


export const useTemplaterAndProjector = (debugName) => {


    let storedSlot

    let defineTemplateProps

    callCount++

    const DefineTemplate = createAstroFunctionalComponent((props, slots) => {



        throwUnless(
            typeof slots.default === "function",
            "Please pass a Child into this component",
            `DefineTemplate${debugName?.toUppercase() ?? callCount} Invalid Child`
        )


        storedSlot = slots.default

        defineTemplateProps = Object.freeze(props)

    })



    const Projector = createAstroFunctionalComponent((props, slots) => {



        const projectorSlotResult = slots?.default?.()

        const projectorSlotFirstExpression = projectorSlotResult?.expressions.at(0)


        const theProjectorSlotFirstExpressionIsNotAFunctionButTheDefineTemplateContextIsAnObject =
            typeof projectorSlotFirstExpression !== "function" && isObject(defineTemplateProps);


        throwIf(
            theProjectorSlotFirstExpressionIsNotAFunctionButTheDefineTemplateContextIsAnObject,
            "You must pass in a function as the child if the defineTemplateContext is used",
            `Projector${debugName?.toUppercase() ?? callCount} Invalid Child`
        )



        const storedSlotResult = storedSlot()

        const storedSlotFirstExpression = storedSlotResult.expressions.at(0)


        const getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult = () =>
            executeIfElse(
                typeof projectorSlotFirstExpression === "function",
                () => executeIf(
                    isObject(defineTemplateProps),
                    () => projectorSlotFirstExpression(defineTemplateProps)
                ),
                () => projectorSlotResult

            )



        return executeIfElse(
            typeof storedSlotFirstExpression === "function",
            () => executeIfElse(
                isObject(props),
                () => storedSlotFirstExpression(
                    Object.freeze(props),
                    getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult
                ),
                () => storedSlotFirstExpression(
                    getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult
                )
            ),
            () => storedSlot
        )





    })




    return [DefineTemplate, Projector]


}