# Miscellaneous

This page is for components and utilities and components that don't need a page.

## Components


### Page Link

```jsx
<PageLink href={`/${string}`} >
 {
    | ((isActive: boolean) => string | Array<HTMLAttributes<"div">>)
    | Array<astroHTML.JSX.HTMLAttributes>
    | string;
 }
</PageLink>
```

This is a component that accepts all of the props of an Anchor Element and the forces you to pass in a href by default.
What is does is automatically determine if the page is the current active page if it is then it will
add a border to the bottom of that element by default.
It renders an anchor with the child passed in what is supposed to be between the tags.

#### Props


| name            | type        | description                                              |
| --------------- | ----------- | -------------------------------------------------------- |
| href            | string      | It's supposed to be the route to the pages on your site  |
| children        | Astro Child | A normal child                                           |
| children (func) | function    | A function that passes the active state of the page link |

Usage

:::info Normally

```tsx
<PageLnk href="/home">Link</PageLnk>
```

:::

:::info Using Active Link

```tsx
<PageLnk href="/home">
{(isActive)=> (
    <span style={{backgroundColor: isActive ?'gray': null}}>
        Home
    </span>
)}
</PageLnk>
```

:::

:::tip
To change the active class of the you can use the `a[aria-current="page"]` selector to change it's styling.
:::

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
