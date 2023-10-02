# Miscellaneous

This page is for components and utilities and components that don't need a page.

## Components

### Astro Gap

```tsx

type AllowedColors =
  | "red"
  | "green"
  | "blue"
  | "purple"
  | "black"
  | "indigo"
  | "orange"
  | "yellow"
  | "brown"
  | "white";

<Gap spaces={number} color={AllowedColors} />
```

A component that is useful for creating space between elements.
It's a server component that accepts a space prop.
When passed it will try to find out how to space itself based on
the parent element's display.
If it's display makes elements align horizontally it's width changes.
If vertically it's width changes.

It tries to make sure that it's between two elements.
If not an error will be thrown.

## Utilities

### Create Markdoc Function

This functions purpose it to allow the user to pass in a callback
function that will take the values passed from markdoc's transform
function into it. A markdoc function can be created instantly like this

```ts
const createMarkdocFunction =  (cb:(...args)=> any) => {
    transform(parameters: Record<number, unknown>): any;
}
```
