# Remark HTML Directives


## Installation 

```js 
npm i -D remark-directive remark-html-directives 
```



## Usage

To use this plugin make sure that you register this one after the remark directive package. This package needs that one in order to be useful.

**For Example**

```js 
export default {
  plugins: [
    "remark-directive",
    "remark-html-directives"
  ]
}
```

## Introduction

This package is a package that is used to allow people to write html inside of each of their markdown. The way this is done is through directives. A directive is a syntax that is eventually compiled to markdown. A markdown directive typically starts with a `:`  a name next to it then a `[]`. For example `:a[link to somewhere]`. This example was called a **text directive**. 
A **block directive** is written like this `:::div :::` a **leaf directive** is written like this `::span`. You can also add html attributes as well. You do this by using the `{}` syntax. The `{}` syntax allows you to write classes and attributes like this `:a[goo]{href=www.go\o\.com}`. Your markdown will render just fine with this plugin. 


## Container directives

A container directive is a directive that must use either a block element tag name or a table cell, row or data-cell element. The syntax is written like this

```md

:::section 

::img{src="foo.jpeg" alt=''}

:::

```

As you can see these directives are meant to contain other directives or even just mark down. The `:::` before the name represent the start of the container. The `:::` at the represent the end of the container. Any markdown written inside of this directive will render as html that is contained by the tag produced by this tag. Which means the example above will produce the below html.

```html
<section>

<img src="foo.jpeg" alt="" />

</section>
```

## Leaf directives

A leaf directive can only generate tags that are by default inline tags , or
'br', 'button', 'i', 'img', 'map', 'iframe', 'span',. that's it. The syntax is written like this

```md  
::span[good]  
```

The above example will render the html below.

```html 
<span>good</span>
```

**!Note: leaf directives can only contain text by using the `[]` syntax and attributes by using the `{}` syntax.** 

## Text directives

A text directive is a directive that is supposed to be put inside of text. It is created to give text meaning. Any html tag that is suposed to affect text in a special way is a text directive. This means that they are supposed to be written inside of anything that contains text. The syntax is like this.

```md
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
:mark[Suspendisse] id fringilla ipsum. 
Interdum et malesuada fames ac ante ipsum primis in faucibus.
 Morbi non tellus id felis efficitur sagittis. 
Suspendisse :abbr[fringilla] neque eget scelerisque :strong[venenatis]. 
 Mauris a mi nunc. 
```

**The example above will render**
```html
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
<mark>Suspendisse</mark> id fringilla ipsum. 
Interdum et malesuada fames ac ante ipsum primis in faucibus. 
Morbi non tellus id felis efficitur sagittis. 
Suspendisse <abbr>fringilla</abbr> neque eget scelerisque <strong>venenatis</strong>. 
Mauris a mi nunc. 
```

## HTML Attributes

A directive can contain any HTML Attribute all of them will be processed properly. To start you use the `{}` at the end of every directive that you create. You can the type your attributes by typing a key `src=` followed by a value `foo.jpg` together ypu get `{src=foo.jpg}`. The key must always have an `=` sign right next to it. 

### Shorhands

You can also type shorthands for ids and classes . You'd normally type `{class=text-gray-600, id=container}` as attributes you instead write `{.text-gray-900 #container}` as a shorthand. 
