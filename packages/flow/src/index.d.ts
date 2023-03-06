

import type {
  GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed
} from "@forastro/utilities";

 type ForProps<T extends Iterable<unknown>> = {
  of: T;
  children: GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T>;
};
type SwitchProps = {
  of: unknown;
  children: Array<CaseProps>;
};

type CaseProps = {
  of: unknown;
  children: astroHTML.JSX.HTMLAttributes | string;
};

type ShowProps<T> = {
  when: T
  children: Array<astroHTML.JSX.HTMLAttributes> | ((value:T) => unknown) 
}

declare function For<T extends Iterable<unknown> >(props: ForProps<T>): unknown 
declare function Switch(props: SwitchProps): unknown 
declare function Case(props: CaseProps): unknown 
declare function Show<T>(props: ShowProps<T>): unknown 
 

export {For, Switch, Case, Show}