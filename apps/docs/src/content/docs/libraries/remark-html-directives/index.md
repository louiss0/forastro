[Tags Page]: /libraries/remark-html-directives/tags
[Tags Page Region Section]: /libraries/remark-html-directives/tags#region
[Tags Page Component Section]: /libraries/remark-html-directives/tags#component
[Tags Page Block Table Section]: /libraries/remark-html-directives/tags#block-table
[Tags Page Inline Table Section]: /libraries/remark-html-directives/tags#inline-table
[Tags Page Inline Section]: /libraries/remark-html-directives/tags#inline
[Tags Page Headings Section]: /libraries/remark-html-directives/tags#headings
[Astro Site]: https://astro.build

# Remark HTML Directives Integration <Badge type="info" text="1.1.0" />

The `@forastro/remark-html-directives-integration` integrates `remark-directive` into your [Astro][Astro Site] project.

It uses an internal library to allow you to use HTML tag names as directives.
It also makes sure you write them in markdown the way you would write them in HTML.
For this we use something called a tag system. It's there to make sure
only HTML that is needed to write articles,docs and blog posts is allowed.

```shell
   astro add @forastro/remark-html-directives-integration
```

For an understanding of Markdown Directives go [here](#markdown-directives)
If you want to understand the tag system go [here](#tags)

:::warning
I created a separate package called `@forastro/remark-html-directives`.
But that one will never be updated it's still useful and can be used in
non-astro projects but I have decided that it's too much work to release it
along with the integration for Astro. If you decided to use them separately
Please use the integration from now on.

**I will not remove the package at all just leave it there**
:::

:::warning
Don't use with MDX at all you can't use the `{}` syntax at all.
Doing `img{}`to mdx is always an expression evaluation no matter what.
:::

## Markdown Directives

A markdown container directive is a directive that allows you to write html inside of markdown.
Without having to use tags. Any attribute that can be added to an html element can be added to markdown directives.
The syntax for them is `[=colon=][name][=content=][{key=value}]`.
The name and colons are necessary so that they become to the proper HTML elements.

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

```[class] markdown
    :::div{.container} :::
```

```[id] markdown
    ::button{#floating-button}
```

:::
::::

### Container

A directive that must wrap around markdown content.

:::info The syntax is written like this.

```md
:::[name]{key=val}
content here
:::
```

:::

:::info Usage

```markdown
:::section
::h2[I'm a heading]
This is a section
:::
```

:::

#### Nesting Containers

When it comes to putting a container inside of another container the parent container must have one more colon
than it's children. This must happen the more containers are nested inside each other.

:::info Creating a section

```markdown
::::section
:::div I'm a div inside of a section.
:::
::::
```

:::

### Leaf

A directive that must be used stand alone they are elements that are meant to just contain text inside of them.

:::info The syntax is written like this.

```md
    ::[name]{key=val}

```

:::

:::info Usage

```markdown
::img{src="/logo.png",alt="A Logo"}
```

:::

### Inline

A directive that is meant to be surrounded by text.
These directives are used to surround words within text so that they can be changed to mean some thing.

:::info The syntax is written like this.

```md
    :[name]{key=val}

```

:::

:::info Usage

```markdown
I like going out for long walks they make me productive.
I use :mark[Monster] for energy and I also drink :span{.capitalize}[prune juice]
```

:::

## Tags

The names of markdown directives are used to render HTML.
This package restricts the names of the directives that you can use by abiding by the HTML spec.
The term _tags_ is used specify what kinds of names are allowed in reference to HTML tags.
When an directive is used the internal library will check to see What kind of directive it is and it's name.
If the wrong name is used as a directive. An error will be thrown. Only certain names can be used as certain directives.

The tags are put into specific categories so that they can be used properly.
The kinds of tags that are allowed to be written are when writing pages or articles are also restricted by tags.

- The tag categories are.

  - Region
  - Component
  - Block Table
  - Inline Table
  - Inline
  - Headings
  - Text

- Container directives only support Region, and Block Table Tags.
- Leaf directives only support Headings, Inline Inline Table,Text Tags.
- Text directives only support Text Tags

:::tip
To see the names of each supported tags go to the [Tags Page][Tags Page]
:::

## Modes

This package restricts the kind of directives you are allowed to use based on whether you are writing pages or articles.
The directives are used to render HTML. So what this package does is modify how they are allowed to be used.
If you are writing articles you can't use directives that generate regions.
If you are writing pages then that means you can write them.
You can also customise directives based on which mode you are in.

### Article Mode

Since markdown is generally used for writing articles. This mode is the default.
You will get an error if you try to write directives that are not suited for writing articles.
This mode assumes that you will render your page's content inside of an Astro layout or an **article tag**.
Tags that specify regions are not allowed here.

- [Component][Tags Page Component Section]
- [Block Table][Tags Page Block Table Section]
- [Inline Table][Tags Page Inline Table Section]
- [Inline][Tags Page Inline Section]
- [Headings][Tags Page Headings Section]

:::info To specify this mode

```ts
{
  mode: 'article';
}
```

:::

:::warning
In article mode you can only alter the default behavior of tags.
:::

::: info To alter the default behavior of tags

```ts

{
 elements:{
    span:{
        class: 'uppercase'
    }
 }
}

```

:::

### Page Mode

This mode is a mode that is used for writing pages. You can use Markdown or MDX as a templating language.
Since you can I have decided not to allow the use of the body tag or any tag that does not belong inside of it at all.
This mode assumes that you are creating content that belongs in a **body tag**.

- [Region][Tags Page Region Section]
- [Component][Tags Page Component Section]
- [Block Table][Tags Page Block Table Section]
- [Inline Table][Tags Page Inline Table Section]
- [Inline][Tags Page Inline Section]
- [Headings][Tags Page Headings Section]

:::info To specify this mode

```ts
{
  mode: 'page';
}
```

:::

:::warning
In this mode you can either customise the default attributes of tags or
specify directive names to be used as container directives.
**Each container directives will only render div tags**.
:::

:::info Specifying Container Directives

```ts
    {
        mode: "page",
        elements:{
            container:{
                class: "mx-auto w-4/5 max-w-sm"
                dataContainer:true
            }

        }
    }
```

:::

:::info Modifying Directives

```ts
    {
        mode: "page",
        elements:{
            p:{
                class:"text-lg"
            }

        }
    }
```

:::
