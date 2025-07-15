# For Astro Utilities

This package is a set of components and functions that make things easier to accomplish with [Astro](https://astro.build).
It's a library that has functions that are useful for conditional rendering and iteration.
It has a link component which is useful for creating links that indicate what page you are on.
A component for creating gaps between elements.
It even has two components that allow you to reuse markup.

## Installation

To install this package `npm i @forastro/utilities`

## Examples

`executeIf<T extends ()=> any>(condition: boolean,cb: T): ReturnType<T> | null`

```ts
 const fruits = ['Apple', 'Strawberry']

 {executeIf(!fruits.includes("Apple"), ()=> 'Not a fruit'))}
```

`iterate<T HasForEachMethod | Generator, U>(iterable:T, (value:unknown: info:IterationInfo, key:unknown)=> U):AsyncGenerator`

```tsx
{iterate([1, 2, 3, 4, 5, 6], (value:number, info:IterationInfo) => (
<div style={{backgroundColor: info.isOdd ? 'red': 'blue' }} >
    {value}
</div>
))}
```

```ts
function useTemplaterAndProjector<
  ProjectorProps extends Record<string, unknown> | null,
  TemplaterProps extends Record<string, unknown> | null = null,
>(
  debugName?: string,
): [
  Templater<ProjectorProps, TemplaterProps>,
  Projector<TemplaterProps, ProjectorProps>,
];
```

Creating a template

```astro
---
 const [RandomStringTemplate, RandomStringProjector] = useTemplaterAndProjector()
---

<RandomStringTemplate>
    I'm content
</RandomStringTemplate>
```

```astro
<RandomStringProjector/>
```

## Docs

Please checkout the docs for [For Astro Utilities](https://forastro-docs.onrender.com/libraries/utilities)

## Contributions

If you want to contribute to the repo then go to this [site](https://github.com/forastro/louiss0/forastro)
