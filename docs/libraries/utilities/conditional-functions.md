# Conditional Functions

Functions that take in two parameters. a boolean and a callback.
When the condition is true or not it executes the function that was passed through. If not it will instead not call the function. The two functions presented below are functions that do the same thing in reverse.

## Execute If

```ts
    executeIf<T extends Callback>(condition: boolean, 
        cb: T
    ): ReturnType<T> | null
```

A conditional function that will execute the callback passed to it.
If the condition is true.

### Usage

**The below function will execute**.

```jsx
 const fruits = ['Apple', 'Strawberry']

 {executeIf(!fruits.includes("Apple"), ()=> 'Not a fruit'))}
```

## Execute Unless

```ts
    executeUnless<T extends Callback>(condition: boolean,
     cb: T
    ): ReturnType<T> | null
```

A conditional function that will execute the callback passed to it.
If the condition is not true.

### Usage

**The below function will not execute.**

```jsx
 const fruits = ['Apple', 'Strawberry']
    
 {executeUnless(fruits.includes("Strawberry"), ()=> 'Not a fruit'))}
```
