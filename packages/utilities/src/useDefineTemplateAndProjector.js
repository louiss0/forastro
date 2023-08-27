
import { createAstroFunctionalComponent, } from './lib/helpers';





export const useDefineTemplateAndProjector = () => {


    let storedSlot

    let defineTemplateContext

    const DefineTemplate = createAstroFunctionalComponent(({ context }, slots) => {

        storedSlot = slots.default

        defineTemplateContext = context

    })



    const Projector = createAstroFunctionalComponent(({ context }, slots) => {



        const projectorSlotResult = slots.default()

        const projectorSlotFirstExpression = projectorSlotResult.expressions.at(0)

        const storedSlotResult = storedSlot()

        const storedSlotFirstExpression = storedSlotResult.expressions.at(0)


        /**
         * ! Astro will not render anything properly if a function is not returned from this function
         *  
         */
        const getResultOfTheProjectorSlotWithTheDefineTemplateContextPassedInIfItIsAFunctionIfNotGetTheCurriedProjectorSlotResult = () =>
            typeof projectorSlotFirstExpression === "function"
                ? projectorSlotFirstExpression(defineTemplateContext)
                : projectorSlotResult



        return typeof storedSlotFirstExpression === "function"
            ? context
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