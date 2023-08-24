# Template Projection

// TODO: Change this page to reflect changes in upcoming 2.8.0

In Astro you are normally not allowed to split chunks of HTML into
reuable pieces of HTML in a page. But with this pair of components.
It's possible. They are called `<DefineTemplate/>` and `<Projector/>`.
Define template allows you to create components while. Projector allows you to use the templates.

:::warning
 Define Template must always be used before. Projector.
:::

## Define Template

```jsx
 <DefineTemplate name={Lowerase<string>}>
    {(...args: Array<any>) => 
        unknown | Array<astroHTML.JSX.HTMLAttributes> 
    }
 </DefineTemplate>

```

A component that takes in a child and a name. The name is the name of the template that is supposed to be used by **Projector**.
The child is the template. Define template will store the template in a *Map of templates*.
When it ready to be used then the projector will take from that *Map*
and use one of the names from that map to render the template.

### Props

These are the props that you can pass.

#### Name

The name of the template. It's the name of the key that is used to
store the template in a **Map of Templates**.

:::danger
 It must be lowercased
:::

#### Children

The children of the Define Template can be just children. Or a function

:::tip
If you pass in a function when the template is going to be used.
you can pass data from the **Projector** to the template that will be used to render What ever you want to render.  
:::

## Projector

The component that will render any template that is created by **Define Template**. It takes in the `templateName=` which is the a name that was sent in as the name to **Define Template**. You can also pass in an optional `context=`. Which is an array of values that would be passed to a template that was created by using a function instead of just **HTML**.

```jsx
 <Projector name={Lowerase<string>} context={Array | undefined} >
    {(...args: Array<any>) => 
        unknown | Array<astroHTML.JSX.HTMLAttributes> 
    }
 </Projector>

```

### Props

These are the props that can be accepted.

#### Template Name

A name that was used in define template. To create a template.
It serves as a key to get the template that needs to be rendered.

#### Context

The context is an array of values that are passed to a template that was created with a function instead of just children.

:::info Fun Fact
 This library was inspired by Anthony Fu's `vue-reuse-template`
:::
