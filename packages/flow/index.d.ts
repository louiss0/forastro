import "astro/types"
import type {
   HasForEachMethod,
   GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed,
   IterateRangeCallback
} from "@forastro/utilities"
type FilledCase = {
  of: unknown;
  children: astroHTML.JSX.HTMLAttributes | string;
  default?: never;
};

type DefaultCase = {
  default: true;
  children: astroHTML.JSX.HTMLAttributes | string;
  of?: never;
};


type ForProps<T extends HasForEachMethod | Generator, U> = {
  of: T;
  children: GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T, U>
};
type SwitchProps = {
  of: unknown;
  children: Array<typeof Case>;
};

type CaseProps = FilledCase | DefaultCase;


type ShowProps<T> = {
  when: T
  children: Array<astroHTML.JSX.HTMLAttributes> | ((value:T) => unknown) 
}
type RangeProps<T> = {
  start: number;
  stop: number;
  step?: number;
  children: IterateRangeCallback<T> | Array<astroHTML.JSX.HTMLAttributes> | string 
};

declare function For<T extends HasForEachMethod, U>(props: ForProps<T, U>): unknown 
declare function Switch(props: SwitchProps): unknown 
declare function Case(props: CaseProps): unknown 
declare function Show<T>(props: ShowProps<T>): unknown 
declare function Range<T>(props: RangeProps<T>): unknown 
 

export {For, Switch, Case, Show, Range}