# Show and Hide

 Show and Hide are components that make a decision on whether to display it's child based on a condition. Show is used to display it's child when a condition is true. Hide does the opposite. It hides when a condition is true.

## Show

### Props

These are the acceptable props.

#### When

If this prop is true the child will be rendered.

#### Children

An HTML Element or string to rendered.

#### Cloak

A prop that is used to set the element that is not meant to be shown to.
`display:none` instead of it not being rendered.

:::warning
    Will only work if when is `true`
:::

## Hide

### Props

These are the acceptable props.

#### Children

An HTML Element or string to rendered.

#### Of

If this prop is true the child will not be rendered.

#### Cloak

A prop that is used to set the element that is not meant to be shown to.
`display:none` instead of it not being rendered.

:::warning
    Will only work if when is `true`
:::
