# Range Generators

A range generator is a set of Generators that allow you to generate a set of numbers.
They require three numbers a **start stop and step**. and a boolean called inclusive.
Start and stop are the first two parameters.
Step and inclusive are passed as the third parameter as an object that uses there names.

They generate numbers that are in-between the start and the stop based on the step.
If the start is less than the stop the numbers in-between are ones increased by the step.  
If the start is less than the stop the numbers in-between will ones decreased up by the step.
By default the last number is not included by the calculation.
To change this just set inclusive to `true`.

:::info
Astro transforms all values yielded from generators into Text.
:::

## Range

```ts
    range(start:number,stop:number,{step?:number, inclusive?:true}):Generator<number,void,number>
```

A generator that will instantly follow the rules stated in the introduction.
This function automatically produces values in Astro.

### Uses cases In Astro

:::info `range()` can be instantly used in astro like this.

```jsx
{
  range(1, 10, { step: 2 });
}
```

:::

:::info Resulting in this HTML

```html
2468
```

:::

:::info In most cases you want to wrap the value in html. You can do this.

```jsx
{
  (function* () {
    for (const value of range(1, 10, { step: 2 })) {
      yield <div>{value}</div>;
    }
  })();
}
```

:::

## Iterate Range

```ts

type IterateRangeCallback<U> = (value: number, info: IterationInfo) => U

type IterateRangeOptions = {
    start: number
    stop: number
    step?: number
    inclusive?:true
}

iterateRange<U>(
    callback: IterateRangeCallback<U>,
    options: IterateRangeOptions
):AsyncGenerator<number,void>
```

While range is nice it's problem is that as a developer.
Using HTML and creating conditions on what to do with the value that a range produces is cumbersome.
That is where `iterateRange()` comes in. It's a generator that. takes in a callback then a object.
That specifies the **start,stop** and **,step**.

### Usage

```jsx
{
  iterateRange(
    (value, info) => (
      <div style={{ backgroundColor: info.isFirst ? 'blue' : 'green' }}>
        {value}
      </div>
    ),
    { start: 3, stop: 15, step: 3 },
  );
}
```

:::warning  
 This function only works like this in Astro components like that.
To make it work in other frameworks use a for loop.
:::
