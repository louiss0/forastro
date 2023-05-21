# Switch and Case

Switch and case are two components that are supposed to be used with each other. They both have an `of=` prop. If the of prop sent to case  is equal to the on in a switch then it's child will be rendered. If not. then the one with a default case will be rendered.  

## Switch

A component that Renders any element that was rendered by a `<Case/>`.
If nothing is rendered by a case statement it will render a message telling you to pass in a case component.

```jsx
<Switch of={unknown} cloak={true|undefined} >
    {Array<Case>}
</Switch>
```

### Props

 These are the acceptable props.

#### Of

A prop that takes in any value that Astro accepts.

#### Children

The children are supposed to be `<Case />` that will have one of their children rendered if contains the same as `<Switch />`

#### Cloak

A prop that must be true or undefined. If the prop is true then instead the children from all cases not being able to be rendered when their `of=` are not the same as itself. Instead they will be rendered as `display: none` in the browser.  

## Case

This component must be under a `<Switch/>` to be useful. It takes in either a `of=` prop or a `default=` prop. The user must pick between either one. It also has to have a child that is HTML. This component will render it's HTML if the `of=` prop passed is the same as the one in Switch.
Of if none of it's other siblings were rendered But. A default prop was placed on it. Then that child will render.

```jsx
<Case of={unknown} >
    {Array<astro.JSX.HTMLAttributes>}
</Case>
```

### Props

 These are the acceptable props.

#### Of

A prop that takes in any value that Astro accepts.

#### Children

The children must be one or more HTML Elements. They must be put inside of this component.

#### Default

The default prop is a prop that makes it so that if no other cases are true then the it's child will be the one that will be rendered.  

:::danger
If no cases render a component the **Switch** component will render a message that asks to place in a case component.
:::
