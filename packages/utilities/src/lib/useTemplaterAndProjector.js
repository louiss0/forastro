
import { createAstroFunctionalComponent, } from './helpers';
import { executeIfElse, executeIf, throwUnless } from './helpers/conditional';



let callCount = 0


export const useTemplaterAndProjector = (debugName) => {


    let storedSlot

    let templaterProps

    callCount++

    const Templater = createAstroFunctionalComponent((props, slots) => {



        throwUnless(
            typeof slots.default === "function",
            `Please pass a Child into this component
            Templater${debugName?.toUpperCase() ?? callCount} Invalid Child`
        )


        storedSlot = slots.default


        if (props) return (templaterProps = Object.freeze(props));



    })



    const Projector = createAstroFunctionalComponent((props, slots) => {


        const templaterPropsHasKeys = templaterProps && Object.keys(templaterProps).length > 0;

        const storedSlotResult = storedSlot()

        const storedSlotFirstExpression = storedSlotResult.expressions.at(0)


        const projectorPropsHasKeys = Object.keys(props).length > 0;


        return executeIfElse(
            typeof storedSlotFirstExpression === "function",

            () => executeIfElse(
                projectorPropsHasKeys,

                () => storedSlotFirstExpression(
                    Object.freeze(props),

                    executeIfElse(
                        templaterPropsHasKeys,

                        () => () => slots.default(templaterProps),

                        () => slots.default,
                    )
                ),

                () => storedSlotFirstExpression(slots.default)
            ),
            storedSlot
        )





    })




    return [Templater, Projector]


}