
import type { getImage } from "astro:assets";
import type { FunctionalComponent } from "preact";
import { clsx } from 'clsx'
type Props<T extends string> = Omit<
  Parameters<typeof getImage>[0],
  "format"
> & {
  src: string;
  alt: string;
  height: number;
  class?: T extends "object-cover" ? never : T;
  width: number;
};

type ImageFunctionalComponent<T extends string = string> = FunctionalComponent<Props<T>>

export const Image:ImageFunctionalComponent = (props) => {

  const { src, alt, width, height, class: $class } = props;
return <img class={clsx("object-cover",$class)} {...{src, alt, width, height}} />
} 



