
import { createAstroFunctionalComponent, executeIf, executeUnless, isObject, } from './lib/helpers';



let callCount = 0



export const useDefineTemplateAndProjector = (debugName) => {


    let storedSlot

    let defineTemplateContext

    callCount++

    const DefineTemplate = createAstroFunctionalComponent(({ context }, slots) => {


        executeUnless(typeof slots.default === "function", () => {

            throw new Error("Please pass a Child into this component", {
                cause: `DefineTemplate${debugName?.toUppercase() ?? callCount} Invalid Child`
            })
        })

        const contextIsDefinedButItIsNotAnObjectLiteral = context && !isObject(context);

        executeIf(contextIsDefinedButItIsNotAnObjectLiteral, () => {

            throw new Error("The context must be an object literal", {
                cause: `DefineTemplate${debugName?.toUppercase() ?? callCount} Invalid Type`
            })

        })

        storedSlot = slots.default

        defineTemplateContext = context

    })



    const Projector = createAstroFunctionalComponent(({ context }, slots) => {



        const projectorSlotResult = slots?.default?.()

        const projectorSlotFirstExpression = projectorSlotResult?.expressions.at(0)


        const theProjectorSlotFirstExpressionIsNotAFunctionButTheDefineTemplateContextIsAnObject =
            typeof projectorSlotFirstExpression !== "function" && isObject(defineTemplateContext);

        executeIf(
            theProjectorSlotFirstExpressionIsNotAFunctionButTheDefineTemplateContextIsAnObject, 
            () => {

            throw new Error(
                "You must pass in a function as the child if the defineTemplateContext is used",
                {
                    cause: `Projector${debugName?.toUppercase() ?? callCount} Invalid Child`
                }
            )
        })

        const storedSlotResult = storedSlot()

        const storedSlotFirstExpression = storedSlotResult.expressions.at(0)


        const getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult = () =>
            typeof projectorSlotFirstExpression === "function"
                ? executeIf(
                    isObject(defineTemplateContext), 
                    () => projectorSlotFirstExpression(defineTemplateContext)
                )
                : projectorSlotResult



        return typeof storedSlotFirstExpression === "function"
            ? isObject(context)
                ? storedSlotFirstExpression(
                    context,
                    getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult
                )
                : storedSlotFirstExpression(
                    getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult
                )
            : storedSlot



    })




    return Object.freeze([DefineTemplate, Projector])


}