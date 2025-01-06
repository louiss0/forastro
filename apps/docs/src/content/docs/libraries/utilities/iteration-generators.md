# Iteration Generator

An _iteration generator_ is a generator that iterates over an iterable and **passes through
in a callback function** at least the current value and an object called the _iteration info_. Which is and object that
gives away info about the current iteration of the object. How many iterations there are going to be.
All of them are generators. Some async some not They are created to be well typed.

:::warning
Async generators are best used inside of Astro components
:::

:::warning
Some generators will only accept an iterable that has a `forEach()` on it.
The method is used as a part of the process of iteration.  
:::

## Iteration Info

The iteration info is an object that is created to pass on information about the current iteration.

:::info
This table below is a decscription of all the properties of the IterationInfo.
:::

| key       | type    | Definition                                  |
| --------- | ------- | ------------------------------------------- |
| isFirst   | boolean | Value is true if iteration is the first one |
| isLast    | boolean | Value is true if iteration is the last one  |
| isOdd     | boolean | Value is true if the iteration is odd       |
| isEven    | boolean | Value is true if the iteration is even      |
| count     | number  | The total amount of iterations              |
| remaining | number  | The total amount of iterations remaining    |

<!-- :::info Iteration Info Props Table

::: -->

## Iterate

```ts
iterate<T HasForEachMethod | Generator, U>(
    iterable:T, (value:unknown: info:IterationInfo, key:unknown)=> U
):AsyncGenerator
```

A function that takes in either a generator or a iterable with a `forEach()`  
as the first parameter and a callback as the second.
It iterates through the first parameter and passes through it's **value**,
the [Iteration Info](#iteration-info).
If the first parameter is a iterable with a `forEach()` the key as the last parameter.

:::warning
This function works for Astro components
:::

### Usage in Astro

```jsx
{iterate([1,2,3], (value:number, info:IterationInfo) => (
<div style={{backgroundColor: info.isOdd ? 'red': 'blue' }} >
    {value}
</div>
))}
```

## Sync Iterate

```ts
syncIterate<T HasForEachMethod | Generator, U>(
    iterable:T, (value:unknown: info:IterationInfo, key:unknown)=> U
):Generator
```

A function that takes in either a generator or a iterable with a `forEach()`  
as the first parameter and a callback as the second.
It iterates through the first parameter and passes through it's **value**,
the [Iteration Info](#iteration-info).
If the first parameter is a iterable with a `forEach()` the key as the last parameter.

:::warning
This function works for Non components. When using React you'll get and error.
In React use a method that generates arrays instead.
:::

### Usage in React

```jsx
{Array.from(syncIterate([1,2,3], (value:number, info:IterationInfo) => (
<div style={{backgroundColor: info.isOdd ? 'red': 'blue' }} >
    {value}
</div>
)))}
```

### Usage in Vue

```vue
<script setup lang="ts">
    const generatedNumberAndIterationInfo =
    syncIterate(
        [1,2,3],
        (value:number, info:IterationInfo) => [value,info])
        )
</script>

<div
v-for="[value, info] in generatedNumberAndIterationInfo"
style={{backgroundColor: info.isOdd ? 'red': 'blue' }}
>
    {{value}}
</div>

```
