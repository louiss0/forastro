# For Astro Remark HTML Directives

This package is a package that is designed to configure Remark Directive in a way that conforms to the HTML standard. It will not allow users to use form or form related tags. They are also not allowed to use the body tag or any tag that is used in the head tag. Since you are using Astro
it's simply better to use An Astro component layout for your custom needs.

I have decided to explain the contents of this plugin in the form of documentation

[Docs on This Library](https://forastro-docs.onrender.com/libraries/remark-html-directives)

Remember **you must always call this function to use it**

## Usage

```shell
npm i -D remark-directive @forastro/remark-html-directives 
```

### Default

```mjs
import remarkHTMLDirectives from "@forastro/remark-html-directives"
 export default defineConfig({
    remarkPlugins:[
        "remark-directive",
        remarkHTMLDirectives()
    ]
 })
```

### Article Mode

```mjs
import remarkHTMLDirectives from "@forastro/remark-html-directives"
 export default defineConfig({
    remarkPlugins:[
        "remark-directive",
        remarkHTMLDirectives({mode:'article'})
    ]
 })
```

### Page Mode

```mjs
import remarkHTMLDirectives from "@forastro/remark-html-directives"
 export default defineConfig({
    remarkPlugins:[
        "remark-directive",
        remarkHTMLDirectives({mode:'page'})
    ]
 })
```

## Recommendations

- Please use along with

  - [MDX](https://docs.astro.build/en/guides/integrations-guide/mdx/)
  - [Remark HTML Directive Snippets](https://marketplace.visualstudio.com/items?itemName=SheltonLouis.remark-html-directives-snippets)
