# Page Link

```jsx
<PageLink href={`/${string}`} >
 {
    | ((isActive: boolean) => string | Array<HTMLAttributes<"div">>)
    | Array<astroHTML.JSX.HTMLAttributes>
    | string;
 }
</PageLink>
```

This is a component that accepts all of the props of an Anchor Element and the forces you to pass in a href by default. What is does is automatically determine if the page is the current active page if it is then it will add a border to the bottom of that element by default. It renders an anchor with the child passed in what is supposed to be between the tags.

## Props

The props that are supposed to be passed in are written here.

### Href

The href is the link to a page. Since it is supposed to be the link of your current page then you are supposed to pass in a `/` as the prefix. If not then this link will not work the way you want it to.

### Children

The children could either be a function, string or any amount of elements.
When you pass in a function you get access to the knowledge of whether or not the page is the current active page Which is a boolean.

## Usage

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
