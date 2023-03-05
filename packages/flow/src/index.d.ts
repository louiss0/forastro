import { GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed } from "@forastro/utilities";

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

function For<T>(props: ForProps<T>): unknown 
function Switch(props: SwitchProps): unknown 
function Case(props: CaseProps): unknown 
function Show<T>(props: ShowProps<T>): unknown 
 

export {For, Switch, Case, Show}