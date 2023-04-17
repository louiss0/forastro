
import Gap from "./src/lib/components/Gap.astro"
import DefineTemplate from "./src/lib/components/DefineTemplate.astro"
import Projector from "./src/lib/components/Projector.astro"
import PageLink from "./src/lib/components/PageLink.astro"
import IslandMirror from "./src/lib/components/IslandMIrror.astro"


export {
    iterate,
     range,
    iterateRange,
    executeIf,
    executeUnless
 } from "./src/lib/helpers"

export type {
    HasForEachMethod,
    GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed,
     IterationInfo,
     IterateRangeCallback,
     IterateRangeOptions
} from "./src/lib/types"

export {
    Gap,
    DefineTemplate,
    Projector,
    PageLink,
    IslandMirror,
}

