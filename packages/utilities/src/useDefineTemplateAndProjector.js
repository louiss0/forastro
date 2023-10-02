
import { createAstroFunctionalComponent, executeIf, executeIfElse, isObject, throwIf, throwUnless } from './lib/helpers';



let callCount = 0


export const useDefineTemplateAndProjector = (debugName) => {


    let storedSlot

    let defineTemplateContext

    callCount++

    const DefineTemplate = createAstroFunctionalComponent(({ context }, slots) => {



        throwUnless(
            typeof slots.default === "function",
            "Please pass a Child into this component",
            `DefineTemplate${debugName?.toUppercase() ?? callCount} Invalid Child`
        )


        const contextIsDefinedButItIsNotAnObjectLiteral = context && !isObject(context);

        throwIf(
            contextIsDefinedButItIsNotAnObjectLiteral,
            "The context must be an object literal",
            `DefineTemplate${debugName?.toUppercase() ?? callCount} Invalid Type`

        )


        storedSlot = slots.default

        defineTemplateContext = context

    })



    const Projector = createAstroFunctionalComponent(({ context }, slots) => {



        const projectorSlotResult = slots?.default?.()

        const projectorSlotFirstExpression = projectorSlotResult?.expressions.at(0)


        const theProjectorSlotFirstExpressionIsNotAFunctionButTheDefineTemplateContextIsAnObject =
            typeof projectorSlotFirstExpression !== "function" && isObject(defineTemplateContext);


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
                    isObject(defineTemplateContext),
                    () => projectorSlotFirstExpression(defineTemplateContext)
                ),
                () => projectorSlotResult

            )



        return executeIfElse(
            typeof storedSlotFirstExpression === "function",
            () => executeIfElse(
                isObject(context),
                () => storedSlotFirstExpression(
                    context,
                    getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult
                ),
                () => storedSlotFirstExpression(
                    getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult
                )
            ),
            () => storedSlot
        )





    })




    return Object.freeze([DefineTemplate, Projector])


}