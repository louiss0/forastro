import "astro/types"
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



type HasForEachMethod = {
    forEach<T>(callbackfn: (...args:Array<unknown>) => T, thisArg?: typeof  globalThis): void;
}
type GenerateParamsArrayFromArrayType<T extends Array<unknown>> = Parameters<
  Parameters<T["forEach"]>[0]
>;


type FunctionBasedOnArrayType<T extends Array<unknown>> = (
  value: GenerateParamsArrayFromArrayType<T>[0],
  info: typeof import("@forastro/utilities/src")
) => unknown;

type GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T> =
    T extends HasForEachMethod
	? Parameters<T["forEach"]>[0] : T extends Generator
    ? <U>(value: ReturnType<T["next"]>["value"]) => U
    : (...args: Array<unknown>) => unknown


type ForProps<T extends HasForEachMethod | Generator> = {
  of: T;
  children: T extends Array<unknown>
    ? FunctionBasedOnArrayType<T>
    : GetAppropriateFunctionBasedOnWhetherOrNotAGeneratorOfAnIterableWithTheForEachMethodIsPassed<T>
};
type SwitchProps = {
  of: unknown;
  children: Array<CaseProps>;
};

type CaseProps = FilledCase | DefaultCase;


type ShowProps<T> = {
  when: T
  children: Array<astroHTML.JSX.HTMLAttributes> | ((value:T) => unknown) 
}
type RangeProps = {
  start: number;
  stop: number;
  step?: number;
  children: ((value:number, info:IterationInfo)=> number) | Array<astroHTML.JSX.HTMLAttributes> | string 
};

declare function For<T extends HasForEachMethod>(props: ForProps<T>): unknown 
declare function Switch(props: SwitchProps): unknown 
declare function Case(props: CaseProps): unknown 
declare function Show<T>(props: ShowProps<T>): unknown 
declare function Range(props: RangeProps): unknown 
 

export {For, Switch, Case, Show, Range}