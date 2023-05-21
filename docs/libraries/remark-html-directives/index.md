<!-- markdownlint-disable-next-line MD033 -->
# Remark HTML Directives <Badge type="info" text="1.0.5" />

The `@forastro/remark-html-directives` package is a package that makes it go that you can use Markdown Container Directives. In [Astro](https://astro.build). It relies on another plugin called
`remark-directive` in order to generate directives.  

:::code-group

 ```[pnpm]
    pnpm add remark-directive @forastro/remark-html-directives
 ```

 ```[yarn]
    yarn add remark-directive @forastro/remark-html-directives
 ```

 ```[npm]
    npm i remark-directive @forastro/remark-html-directives
 ```

:::

## Markdown Container Directives

A markdown container directive is a directive that allows you to write html inside of markdown.
Without having to use tags. Any attribute that can be added to an html element can be added to markdown directives. The syntax for them is `[=colon=][name][=content=][{key=value}]`. The name and colons are necessary so that they become to the proper HTML elements.

:::info

- The name is the name of the directive.
- The content is for short written text
- The key=value stands for all the properties that are added

:::

:::info There are three kinds of directives

- Container
- Leaf
- Inline

:::

::::info The shorthands for class and id are supported as well.

:::code-group

```[class]
    :::div{.container} :::
```

```[id]
    ::button{#floating-button}
```

:::
::::

## Tags

To make sure that Markdown is written well I have decided to restrict the way that tags are used. This library only supports HTML tags that are supposed to be written inside of the body and no form tags. There are a list of supported tags that are meant to be used.

:::info Block Tags

- address
- code
- article
- aside
- blockquote
- details
- summary
- div
- dl
- figcaption
- figure
- footer
- header
- hr
- li
- main
- nav
- ol
- p
- pre
- section
- ul
- video
- audio
- picture
- hgroup
- table
- tfoot
- thead
- tbody

:::

:::info Inline Tags

- br
- button
- i
- img
- map
- iframe
- span
- source

:::

:::info Text Tags

- cite
- code
- dfn
- em
- strong
- sub
- sup
- time
- var
- mark
- q
- small
- kbd
- samp
- a
- abbr
- bdo
- data
- dd
- dt

:::

:::info Heading Tags

- h1
- h2
- h3
- h4
- h5
- h6

:::

:::info Table Tags

- tr
- th
- td
- col
- caption
- colgroup

:::

## Container

A directive that must wrap around markdown content.

:::info The syntax is written like this.

```console
 :::[name]{key=val}
    content here
    :::    
```

:::

### Usage

```markdown
 :::section
    ::h2[I'm a heading]
    This is a section
    :::
```

:::warning
 They only support Block and table tags
:::

### Nesting Containers

When it comes to putting a container inside of another container the parent container must have one more colon than it's children. This must happen the more containers are nested inside each other.

:::info Creating a section

```markdown
 ::::section
    :::div I'm a div inside of a section.
       :::
     ::::

```

:::

:::info Creating a card with tailwind

```markdown
:::::figure
        ::::div
            ::img{src="pic.jpg"}
        ::::
        
        ::::div{.flex.justify-center}
     
            :::div
                ::img{src="male.jpg"}
            :::
        
            :::div
                ::img{src="female.jpg"}
            :::
        ::::
     
     :::::
```

:::

## Leaf

A directive that must be used stand alone they are elements that are meant to just contain text inside of them.

:::info The syntax is written like this.

```console
    ::[name]{key=val}
         
```

:::

### Usage

```markdown
 ::img{src="/logo.png",alt="A Logo"}
    
```

:::warning
 They support heading, table, inline, text tags.
:::

## Inline

A directive that is meant to be surrounded by text. These directives are used to surround words within text so that they can be changed to mean some thing.

:::info The syntax is written like this.

```console
    :[name]{key=val}
         
```

:::

### Usage

```markdown
  I like going out for long walks they make me productive. I use :mark[Monster] for energy and I also drink :span{.capitalize}[prune juice] 
```

:::warning
 They only support text tags.
:::
