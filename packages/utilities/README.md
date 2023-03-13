# For Astro Utilities

This package is a set of valuable functions and utilities for [Astro](https://astro.build) these utilities are created to be practical and remove lots of boilerplate code.

## Installation

To install this package `npm i @forastro/utilities`

## Functions

The functions in this library are generators that return values that are meant to be used by Astro. They will pass up to three values. The value, key, and a special object called the `IterationInfo`. The value and iteration info will always be passed. But the key is not passed. The iteration info is created to give people information critical information about the current iteration. The iterable that was passed in is never passed back into the function.

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

```ts
iterate(iterable, cb):AsyncGenerator<Awaited<U>, void, unknown>
```

**Definition**

A generator that when used iterates over the entries of any iterable that is passed. It yields the value that is returned by the callback function. The callback function gives you an the values , keys and the iteration info in that order.

**Parameters**

iterable: A generator a Iterable that has the `forEach()`
cb: a callback function that returns values based on which iterable is passed the third parameter is called the iteration info.

```ts
range(start:number,stop:number,step=1):Generator<number, void, unknown>
```

**Definition**

A generator that will generate a new number based on the numbers that are passed to it. The start is the first number the stop is the final number to be returned.

- If the start lower than stop and step is positive
  - The first number will be the start + step
  - Then the previous result plus step
- If the start is higher than stop
  - The first number will be the start - step
  - Then the previous result minus step

**Parameters**

start: the starting value of range
stop: the final number
step: how many numbers to add to the iteration count during iteration

- The default value is one

```ts
iterateRange(callback, options):AsyncGenerator<Awaited<T>, void, unknown>
```

**Definition**

A generator that uses a range function behind the scenes and passes the parameters from that function into the callback. It yields the value that is returned by the callback function.

**Parameters**

callback: The function that is called based on every iteration
options: an object literal that contains the values that must be passed to range.

- start is the first number
- stop is the second one
- step is the number that is used to change the value returned for each iteration

## Components

The components in this library is one that is meant to be used by Astro. These components must be used in Astro files. **Remember the rules of Astro Components**

```jsx
<Gap spaces={number} color={color} />
```

Gap is a component that exists to create a gap in between two elements. This Component must always be in-between two elements for it to work. It will automatically adjust based on what the display property of the parent is.

`spaces=` : a number that is based on how many spaces that you want to consume.

**The number will be multiplied by the parent's font size to determine the total amount of pixels used**

`color=` : the color of the gap it should only be used to see where the gap is and how it is influencing your layout. The choices are the red, green, blue, purple, black, indigo, orange, yellow, brown, white.

#### Mental Map

The way gap works it that the parent's display property is taken into account then if it's a flexbox or a grid then the gap will change it's width or height accordingly. The table below represents how the `<Gap />` will change it's height or width in response to it's parent's properties.

### Projector

Projector is a component that uses the `id=`, s of templates to display their content You can use `<templates />` everywhere in Astro this component will display the content of a template as many times as needed by you. The template has to have an `id=` The prop sent to it has to be the `templateId=`

> [!warning] Warning  
> Always put your templates at the bottom of components and pages
