
import { BorderOrOutlineSizes } from "~/utilities/types";
import { allTailwindColors } from "~/utilities/constants";
import type { FunctionComponent } from "preact";
import clsx from "clsx";

/**
 ** The border component by default creates a border that surrounds a component
 ** It allows the user to pass in a border size for the border size
 ** Or you can just pass in tailwind classes
 * This component will give you an error if not all of them are border classes
 */

type Props =
  | {
      borderSizeClass?: `border-${BorderOrOutlineSizes}`;
      class?: never;
    }
  | {
      class: string;
      borderSizeClass?: never;
    };

const borderColors = allTailwindColors.map((value) => `border-${value}`);

const errorMessage =
  () => `This class can only use border classes  you can use responsive and media classes but nothing else  
    remember the valid tailwind classes ${borderColors.join(", ")}
    `;


export const Border:FunctionComponent<Props> = (props) => {
  
const { borderSizeClass, class: $class, children } = props;

const borderClassesAreValid =
  typeof $class === "undefined"
    ? true
    : $class
        .split(" ")
        .every((classColor) =>
          borderColors.some((borderColor) => classColor.includes(borderColor))
        );



return <div
  data-border-box
  class={clsx(
    "border border-current",
    borderSizeClass, 
    $class  
  )
  }
>
  {borderClassesAreValid ? children : errorMessage()}
</div>

}

