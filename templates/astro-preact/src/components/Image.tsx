
import type { FunctionalComponent } from "preact";
import { tailwindOrWindiCSSEvaluatorSorterAndFilter } from "@code-fixer-23/cn-efs";


type Props<T extends string> = {
  src: string;
  alt: string;
  height: number;
  class?: T extends "object-cover" ? never : T;
  width: number;
};


export const Image: ImageFunctionalComponent = (props: Props<T>) => {

  const { src, alt, width, height, class: $class } = props;
  return <img class={tailwindOrWindiCSSEvaluatorSorterAndFilter("object-cover", $class)} {...{ src, alt, width, height }} />
}



