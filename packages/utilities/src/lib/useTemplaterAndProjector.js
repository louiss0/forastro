
import { createAstroFunctionalComponent, } from './helpers';
import { executeIfElse, executeIf, throwUnless } from './helpers/conditional';
import { isObject } from './internal';



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


        const propsFromTemplaterIsAnObjectWithItsOwnKeys = isObject(props) && Object.keys(props).length > 0;

        //! Never return fom this function!

        if (propsFromTemplaterIsAnObjectWithItsOwnKeys) {
            templaterProps = Object.freeze(props)
        };



    })



    const Projector = createAstroFunctionalComponent((props, slots) => {

        const storedSlotResult = storedSlot?.()

        const storedSlotFirstExpression = storedSlotResult?.expressions.at(0)


        const projectorPropsIsAnObjectWithItsOwnKeys = isObject(props) && Object.keys(props).length > 0;


        return executeIfElse(
            typeof storedSlotFirstExpression === "function",

            () => executeIfElse(
                projectorPropsIsAnObjectWithItsOwnKeys,

                () => storedSlotFirstExpression(
                    Object.freeze(props),

                    executeIfElse(
                        templaterProps,
                        () => () => slots?.default(templaterProps),

                        () => slots?.default,
                    )
                ),
                () => storedSlotFirstExpression(slots.default)
            ),
            storedSlot
        )





    })




    return [Templater, Projector]


}