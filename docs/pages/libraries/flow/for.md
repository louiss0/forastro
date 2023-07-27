# For

```tsx
<For of={iterable}>
    {(value:unknown, info: IterationInfo, key:unknown) => unknown}
</For>
```

The for component is a for loop that relies on an iterable that has a forEach method It uses that iterable's `forEach()` to generate the data needed to give the callback created by it a. It creates a for loop that passes a function that has three parameters.

- The value
- The [IterationInfo](/libraries/utilities/iteration-generators#iteration-info)
- The key.

What ever is returned from the callback is rendered as HTML.

## Props

These are the props that need to be passed in.

### Of

The of prop is a prop that needs to take in a iterable with a `forEach()`.
The data from each iteration will be passed to the callback that comes from children.

### Children

The chidren is a function that passes in the value, iteration info and key.
This function runs throughout every iteration of the loop inside of the component and will receive new values until the data is done.

## Usage

:::info Alone

```jsx
<For of={["Eren", "Mikasa", "Levi"]}>{(value)=> value}</For>
```

:::

:::info Using the iteration info

```jsx
<For of={["Eren", "Mikasa", "Levi", "Historia"]}>
    {(value, info)=> 
    info.isFirst 
    ? <div style={{color:'red'}} >{value}</div>
    : info.isLast 
    ? <div style={{color:'green'}} >{value}</div>
    : <div>{value}</div>
    }
</For> 
```

:::
