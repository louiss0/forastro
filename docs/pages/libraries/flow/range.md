# Range

```tsx
<Range start={iterable} stop={number} step={number} >
    {(value:number, info: IterationInfo,) => unknown}
</Range>
```

A component allows you to generate a set of numbers based on three numbers a **start stop and step**. If the start is greater than stop the number step must be negative. If the stop is greater than the start the step must be positive. If the former condition is fulfilled the numbers generated will be less than the previous one until the stop is reached. If the latter condition is fulfilled the numbers generated will be greater than the previous one until the stop is reached.

This component will pass values it's child function which is the current value and the [Iteration Info](/libraries/utilities/iteration-generators#iteration-info)

## Props

These are the acceptable props.

### Start

 The number to start from. When all number props are positive.  

### Stop

 The number to stop on. When all number props are negative.

### Step

 The numbers to skip when generating numbers.

### Children

The children is a function that has will be passed the value as the first parameter and the Iteration info as the second parameter. Through out each iteration of the loop. Whatever is returned by the callback will be the value that is rendered by this component.

## Usage

:::info Normal

```jsx
 <Range start={2}, stop={8} >
    {(value)=> value}
 </Range>
```

:::

:::info With Start greater than stop and step minus one.

```jsx
 <Range start={8} stop={2} step={-1}>
    {(value)=> value}
 </Range>
```

:::

:::info Iteration Info

```jsx
<Range start={6} stop={24} step={3}>
{(value, info)=> `${info.isRemaining} is Remaining from ${info.count}` }
</Range>
```

:::
