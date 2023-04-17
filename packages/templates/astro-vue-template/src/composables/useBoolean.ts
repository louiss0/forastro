
import { ref, readonly, Ref } from 'vue'



type UseBooleanReturnValue = [
    boolean: Readonly<Ref<boolean>>,
    setToTrue: () => void,
    setToFalse: () => void,
    toggle: () => void,
]

export default function useBoolean(value = false):UseBooleanReturnValue {


    const boolean = ref(value)



    return [

        readonly(boolean),
        function setToTrue() {
            
        boolean.value = true
        
        },
        
        function setToFalse() {
        boolean.value = false

        },
        
        function toggle() {
        
         boolean.value = !boolean.value
            
        },
    ]
        
    


}