
import { tailwindOrWindiCSSEvaluatorSorterAndFilter } from "@code-fixer-23/cn-efs";
import type { FunctionalComponent } from "preact";
/**
 * This component is created to make sure that everything in between it is in the center 
 * The gap class has only sm and lg because this is as far as typescript can go I don't know what the limit is
 * The flex direction class is there to make sure that the flex direction can be changed during any screen size.
 *  
  
 */

import { AllowedTailwindScreenWidths, SpacingNumbers } from "~/utilities/types";

interface Props {
  gapClass?: `gap-${SpacingNumbers}`;
  smGapClass?: `sm:gap-${SpacingNumbers}`;
  mdGapClass?: `md:gap-${SpacingNumbers}`;
  lgGapClass?: `lg:gap-${SpacingNumbers}`;
  xlGapClass?: `xl:gap-${SpacingNumbers}`;
  xl2GapClass?: `2xl:gap-${SpacingNumbers}`;
  flexDirectionClass?: "flex-col" | "flex-row";
  until?: AllowedTailwindScreenWidths[number];
}



const Center: FunctionalComponent<Props> = (props) => {

  const {
    gapClass = "gap-4",
    flexDirectionClass = "flex-col",
    smGapClass,
    mdGapClass,
    lgGapClass,
    xlGapClass,
    xl2GapClass,
    until,
    children
  } = props;

  const flexRowMap = new Map<
    AllowedTailwindScreenWidths[number],
    `${AllowedTailwindScreenWidths[number]}:flex-row`
  >([
    ["sm", "sm:flex-row"],
    ["md", "md:flex-row"],
    ["lg", "lg:flex-row"],
    ["xl", "xl:flex-row"],
    ["2xl", "2xl:flex-row"],
  ]);
  const flexColMap = new Map<
    AllowedTailwindScreenWidths[number],
    `${AllowedTailwindScreenWidths[number]}:flex-col`
  >([
    ["sm", "sm:flex-col"],
    ["md", "md:flex-col"],
    ["lg", "lg:flex-col"],
    ["xl", "xl:flex-col"],
    ["2xl", "2xl:flex-col"],
  ]);

  const ifFlexDirectionClassISFlexRowAndUntilIsSpecifiedGetFromFlexRowMapIfNotGetFromFlexColMap =
    flexDirectionClass === "flex-row" && until
      ? flexRowMap.get(until)
      : flexDirectionClass === "flex-row" && until
        ? flexColMap.get(until)
        : null;




  return <div
    data-center-box
    class={tailwindOrWindiCSSEvaluatorSorterAndFilter([
      "flex justify-center items-center h-full",
      flexDirectionClass,
      gapClass,
      ifFlexDirectionClassISFlexRowAndUntilIsSpecifiedGetFromFlexRowMapIfNotGetFromFlexColMap,
    ])}
  >
    {children}
  </div>

}

export { Center }