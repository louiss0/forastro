# For Astro Flow

This package is a package that allows you to use flow components inside of [Astro](https://astro.build) Flow components are components that emulate control flow in the form of components. These components are typed well. I did this knowing that there are sometimes where you'd have to change things into an array for the to work. But other than that there should be no problems.

> [!info] There are two kinds of components in here,
> **Conditional** -> Components that show something based on a condition
> **Iterable** -> Components that iterate through a set of items then send data through a callback function

## Installation

`npm install @forastro/flow`

## Iterable Components

> [!warning] Warning,
> Iterable components don't pass down the array as the final argument the `IterationInfo` is passed instead which has information about the current iteration

### Iteration Info Table

| Property  | Type    | Action                         |
| --------- | ------- | ------------------------------ |
| iteration | number  | the current iteration          |
| `isOdd`   | boolean | iteration is odd               |
| `isEven`  | boolean | iteration is even              |
| remaining | number  | how many iterations are left   |
| count     | number  | the total amount of iterations |
| `isFirst` | boolean | is the first iteration         |
| `isLast`  | boolean | is the last iteration          |

```tsx
<For of={HasForEachMethod | Generator}>
  {(value: unknown, key: unknown, info: IterationInfo) => unknown}
</For>
```

**Definition**

This component only takes in generators and Iterables that have a `forEach()` method or generators. It will pass in the value as the first param always but the key as the second one.

```tsx
<Range start={number} stop={number} step={1}>
  {(value: unknown, info: IterationInfo) => unknown}
</Range>
```

**Definition**

This component takes in up to three parameters.

- `start=` the starting number
- `stop=` the final number
- `step=` the number to increment or decrement by

- **To increment start must be less than stop and step must be positive**
- **To decrement start must be greater than stop and step must be negative**

## Conditional Components

```tsx
<Show when={boolean} cloak={true | undefined}>
  {Array<HTMLAttributes> | string}
</Show>
```

**Definition**

It shows it's child only when the condition invoked is invoked but if you use the `cloak=` attribute then the element will be inserted into the DOM but not shown to the user.

```tsx
<Switch of={unknown} cloak={true|undefined}>
{Array<Case>}
</Switch>

<Case of={unknown | never} default={true | never}   >
{Array<HTMLAttributes>|string}
</Case>
```

**Switch Definition**

It shows the element rendered by the `<Case/>` when it's `of=` prop is the same value as it's own. but if you use the `cloak=` attribute then the element will be inserted into the DOM but not shown to the user.

**Case Definition**

It displays the content of it's child only when it's `of=` is the same as a Parent Switch Component. If you want an element to display when there are no cases with a value set to true use `default=`
