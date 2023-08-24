# Range Generators

// TODO: Change this page to reflect changes in 2.7.0

A set of Generators that allow you to generate a set of numbers based on three numbers a **start stop and step**.
If the start is greater than stop the number step must be negative.
If the stop is greater than the start the step must be positive.
If the former condition is fulfilled the numbers generated will be less than the previous one until the stop is reached.
If the latter condition is fulfilled the numbers generated will be greater than the previous one until the stop is reached.

:::info
 Astro transforms all values yielded from generators into Text.
:::

## Range

```ts
    range(start:number,stop:number,step:number):Generator<number,void,number>
```

A generator that will instantly follow the rules stated in the introduction. This function automatically produces values in Astro.

### Uses cases In Astro

:::info `range()` can be instantly used in astro like this. 

```jsx
    {range(1,10, 2)}
```

:::

:::info Resulting in this HTML

```html
    2468
```

:::

:::info In most cases you want to wrap the value in html. You can do this.

```jsx
{(function*(){
    for (const value of range(1,10,2)) {
        yield <div>
            {value}
        </div>        
    }    
})()}
```

:::

## Iterate Range

```ts

iterateRange<U>(
    callback: IterateRangeCallback<U>, 
    options: IterateRangeOptions
):AsyncGenerator<number,void>
```

While range is nice it's problem is that as a developer. Using HTML and creating conditions on what to do with the value that a range produces is cumbersome. That is where `iterateRange()` comes in. It's a generator that. takes in a callback then a object. That specifies the **start,stop** and **,step**.

### Usage

```jsx
    {iterateRange(
        (value, info)=> 
        (<div style={{backgroundColor: info.isFirst ?'blue': 'green'}} >
        {value}
        </div>) , 
        {start:3, stop:15, step:3}
    )}
```

:::warning  
 This function only works like this in Astro components like that.
 To make it work in other frameworks use a for loop.
:::

### Types  

```ts
type IterateRangeCallback<U> = (value: number, info: IterationInfo) => U

type IterateRangeOptions = {
    start: number
    stop: number
    step?: number
}
```
