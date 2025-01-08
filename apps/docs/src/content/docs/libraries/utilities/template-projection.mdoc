---
title: Template Projection
description: ""
---
<!-- markdownlint-disable MD024 -->

You can create templates in Astro SFC's by using a function called `useTemplaterAndProjector`.
It's a function that returns two components in a tuple. `Templater` and `Projector`.
Templater is a component that is supposed to have a child.
The content inside the child is a template that needs to be rendered.
Projector is the component that renders the content in Define template.

The two components can send props to each other through using a prop called the context.
The context is an object literal that holds information that needs to be used.

There are two of them.

- The projector context the information sent from the projector to the templater.
- The templater context the information sent from the templater to the projector.

To use either context you will need to use a function child.
The templater function child can either accept the context and slot or just a slot.
The projector function child can only accept the context.

## Use Templater and Projector

```ts
function useTemplaterAndProjector<
  ProjectorProps extends Record<string, unknown> | null,
  TemplaterProps extends Record<string, unknown> | null = null,
>(
  debugName?: string,
): [
  Templater<ProjectorProps, TemplaterProps>,
  Projector<TemplaterProps, ProjectorProps>,
];
```

The use templater and projector function returns two Astro Components.

It uses two generics that influence the types for components returned.

When you pass in a context into templater.
The projector is expected to return a function as it's child with it as the first argument.
When you pass in a context and a slot into projector the templater is expected to receive it as the first argument.
If only a slot is injected into projector then the templater will get it
as the first argument.

These ideas are enforced on the type level.

:::info When the projector context is passed.

```ts
useTemplaterAndProjector<{ message: string }>();
```

These are the types for templater and projector.

```ts
type Templater = {
  message: string;
  children: (defaultSlot: (() => RenderTemplateResult) | undefined) => unknown;
};

type Projector = {
  message: string;
  children?: Array<astroHTML.JSX.HTMLAttributes> | string;
};
```

:::

:::info When the Define template context is passed only.

```ts
useTemplaterAndProjector<null, { message: string }>();
```

These are the types for templater and projector.

```ts
type ProjectorSlot = (() => RenderTemplateResult) | undefined;

type Templater = {
  message: string;
  children:
    | ((defaultSlot: ProjectorSlot) => unknown)
    | Array<astroHTML.JSX.HTMLAttributes>
    | string;
};

type Projector = {
  children(context: { message: string }): unknown;
};
```

:::

:::info When both context's are is passed.

```ts
useTemplaterAndProjector<{ text: string }, { message: string }>();
```

These are the types for templater and projector.

```ts
type ProjectorSlot = (() => RenderTemplateResult) | undefined;

type Templater = {
  message: string;
  children: (context: { text: string }, defaultSlot: ProjectorSlot) => unknown;
};

type Projector = {
  text: string;
  children(context: { message: string }): unknown;
};
```

:::

:::info When no contexts are passed.

```ts
useTemplaterAndProjector();
```

These are the types for templater and projector.

```ts
type Templater = {
  children:
    | ((defaultSlot: ProjectorSlot) => unknown)
    | Array<astroHTML.JSX.HTMLAttributes>
    | string;
};

type Projector = {
  children?: Array<astroHTML.JSX.HTMLAttributes> | string;
};
```

:::

The only argument that can be passed to this function is called a debug name.
The debug name is a name that is used during errors. It's used to identify
which component threw an error all you have to do is look at the cause in
the error page that astro sends you. The names `Templater` or `Projector`
will be used as a part of the cause.

## Templater

A component that requires a child.
That child is stored so that it could be used by `Projector`.
The child could either be a function, html or a string.
When the child is a function the function can either accept an object
or an object with a slot as it's arguments.

When the slot is passed it must be evaluated as an expression.
The slot could either return something for templater to render or nothing.

:::warning
Never use a fragment with the slot that is passed to templater.
html won't be rendered sometimes.
:::

The only prop that can be passed is the `context=`.
When passed the projector will receive it as the first argument to it's function child.

### Usage

:::info

Activating templater.

```astro

---
 const [RandomStringTemplate, RandomStringProjector] = useTemplaterAndProjector()
---

<RandomStringTemplate>
    I'm content
</RandomStringTemplate>
```

Using the template

```astro
<RandomStringProjector/>

```

:::

:::info

Sending the context to the projector.

```astro

---
const [RandomStringTemplate, RandomStringProjector] = useTemplaterAndProjector()
---

<RandomStringTemplate text="Hello I'm the Random String Template" >
   {(slot)=> <div> I'm content {slot?.()} </div>}
</RandomStringTemplate>
```

Receiving the Templater Context.

```astro
<RandomStringProjector>
    {({text})=>  <span>{text}</span> }
</RandomStringProjector>
```

:::

## Projector

A component that is used to render the child of `Templater`.
It's a component that can pass in a slot as it's child.
It's only required to pass in a child only!
when templater passes in a context and a projector context is passed.
When activated it can pass it's context to the templater to use.

### Usage

:::info

Projector sending the context

```astro

---
 const [RandomStringTemplate, RandomStringProjector] = useTemplaterAndProjector()
---

<RandomStringProjector text="Hello I'm the Random String Template"/>
```

Templater receiving the Context.

```astro
<RandomStringTemplate>
    {({text})=>  <span>{text}</span> }
</RandomStringTemplate>
```

:::

:::info

Projector sending the context and a slot.

```astro


---
 const [RandomStringTemplate, RandomStringProjector] = useTemplaterAndProjector()
---

<RandomStringProjector text="Hello I'm the Random String Template">
    I'm simply content
</RandomStringProjector>

```

Templater receiving the content and slot.

```astro
<RandomStringTemplate>
 {({text}, slot)=>
    <div>
        {text}
        {slot?.()}
    </div>
 }
</RandomStringTemplate>
```

:::

## Limitations

:::warning When using Templater and Projector you might find that Projector doesn't render.
This happens when you attempt to use the projector in the slot of a Client Component.
Client Components render outside of the scope of define templater and projector.

To fix this problem put use templater inside of the Client Component you are rendering.

```astro
---
import { useTemplaterAndProjector } from "@forastro/utilities"
import { ClientComponent } from "@/components/ClientComponent.tsx"

 const [RandomStringTemplate, RandomStringProjector] = useTemplaterAndProjector()

---

<ClientComponent client:idle>
<RandomStringTemplate>
    Hello World from Astro.
</RandomStringTemplate>

<RandomStringProjector/>

</ClientComponent>


```

:::
