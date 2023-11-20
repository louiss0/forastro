
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
            Templater${debugName?.toUppercase() ?? callCount} Invalid Child`
        )


        storedSlot = slots.default

        templaterProps = Object.freeze(props)

    })



    const Projector = createAstroFunctionalComponent((props, slots) => {


        const templaterPropsHasKeys = Object.keys(templaterProps).length > 0;

    
        const storedSlotResult = storedSlot()

        const storedSlotFirstExpression = storedSlotResult.expressions.at(0)


        const projectorPropsHasKeys = Object.keys(props).length > 0;





        let newSlotsMap = executeIf(
             templaterPropsHasKeys,
             ()=> Object.entries(slots).reduce(
                (slotsMap, [key, slotFunction]) => 
                slotsMap.set(key, ()=> slotFunction(templaterProps)),
                new Map()
            )
        );

      const getSlotsBasedOnIfNewSlotsMapIsZero = 
                  executeIfElse(
                        newSlotsMap?.size === 0,
                        () => Object.fromEntries(newSlotsMap),
                        () => slots
                    )

        return executeIfElse(
            typeof storedSlotFirstExpression === "function",
            
            () => executeIfElse(    

                projectorPropsHasKeys,
        
                () => storedSlotFirstExpression(
                    Object.freeze(props),
                  getSlotsBasedOnIfNewSlotsMapIsZero
                ),
        
                () => storedSlotFirstExpression(getSlotsBasedOnIfNewSlotsMapIsZero)
            ),

           ()=>  storedSlot
        )





    })




    return [Templater, Projector]


}