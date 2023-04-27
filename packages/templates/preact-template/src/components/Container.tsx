
/**
 * This is a component that is used for creating a wide vertical space that expands to a specific width
 * This component will always be centered on the screen. 
 * The max width class is used to decide how far the containers should stretch
 * The width is the initial one. 

*/

import type { FunctionalComponent } from "preact";
import type {
  FluidPercentages,
  AllowedTailwindScreenWidths,
} from "~/utilities/types";

interface Props {
  widthClass?: WidthClasses;
  maxWidthClass?: MaxScreenWidthClasses;
}

type WidthClasses = `w-${FluidPercentages}`;

type MaxScreenWidthClasses = `max-w-screen-${AllowedTailwindScreenWidths}`;

export const Container:FunctionalComponent<Props> =(props) => {

  const { widthClass = "w-4/5", maxWidthClass = "max-w-screen-lg", children } =
  props


  return <div data-container class={`mx-auto ${widthClass} ${maxWidthClass}`}>
      {children && <span>Noting to contain</span>}
  </div>
  
} 

