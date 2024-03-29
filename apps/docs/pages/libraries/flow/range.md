# Range

```tsx
<Range start={iterable} stop={number} step={number} inclusive={true | undefined} >
    {(value:number, info: IterationInfo,) => unknown}
</Range>
```

A component that requires two number props `start` and `stop` and a function as child.
When activated it will use a third number will be used called the step.
The function that is passed will receive two arguments.
The value and the [Iteration Info](../utilities/iteration-generators.md#iteration-info).
When the start is less than stop, the number will be the result of the step plus the previous
number starting from start. When in reverse, the number passed through will be subtracted.
Either way new values will be passed until the stop is reached.
To include the stop as the final number use inclusive prop.

The iteration info is recreated with sent new values based on the value.
When created the remaining

## Props

### Required

| name  | description               |
| ----- | ------------------------- |
| start | The number to start from. |
| stop  | The number to stop on.    |

### Optional

| name      | description                                | default   |
| --------- | ------------------------------------------ | --------- |
| step      | numbers to skip when generating numbers.   | 1         |
| inclusive | when defined makes the final number appear | undefined |

### Children

The children is a function that has will be passed two arguments.
The first is the value the second is the Iteration Info.

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
