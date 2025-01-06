# For Astro MDX Template

[Astro Site]: https://astro.build

This template is a template that is created with purpose of creating simple sites with taliwind and Astro.
You can create simple sites with this template by making good use of `@forastro/utilities`.
They will help with making Non to minimally interactive pages quickly.

This template revloves around `@astrojs/mdx` and `@forastro/remark-html-directives-integration`.

The `@forastro/utilities` package is featured here so that you can use it for pages.
It's useful for solving common challenges with [astro][Astro Site].
Remember that the components used are in-fact astro components.

::::info To use this template type.

:::code-group

```[pnpm] shell
   pnpm dlx create-astro --template=louiss0/forastro/templates/astro-mdx
```

```[yarn] shell
   yarn dlx create-astro --template=louiss0/forastro/templates/astro-mdx
```

```[npm] shell
   npx create-astro --template=louiss0/forastro/templates/astro-mdx
```

:::

::::

:::warning Install then upgrade the dependencies

```shell
cd my-project && npm i && npm update
```

:::

For icons `astro-icon` is useful for icons.

| Type          | Name       |
| ------------- | ---------- |
| CSS Framework | Uno        |
| Font Library  | Fontsource |
| Icon Library  | Astro Icon |

## Start Command

**To start the app use:**

:::code-group

```[pnpm] shell
pnpm run start
```

```[npm] shell
npm run start
```

```[yarn] shell
yarn run start
```

:::

## Main Folders

- components - for components
- utilities for - constants, util functions, and types.
- layouts
- pages

## Configuration

There are only two config files in this repo. `astro.config` and `uno.config`. I will split this into two sections.

The `Default.astro` file contains the main stylesheet for uno.
The CSS Variables come from a website called [Utopia](https://utopia.fyi/).
A site that is good for using typography and fluid spacing.
I decided to use a 12 - 16 font range with a transition from a minor third to a major third.

The `--heading-font` variable is used for headings the `--body-font` variable is used for the body.
The step variables are used in the Typography component.

### Astro Config

Experimental Assets are enabled in this template.

### Uno Config

Uno is configured to use dark mode class needs this so that it can trigger dark mode.
The safelisted classes are `hidden, fixed, translate-x-full, translate-y-full, opacity-0`.
This is so that no one ever has to turn them on per project.
Most of the time hidden and fixed will be used but,
I have found that the translate classes can be used in some projects to make it so that something moves in a specific direction.

## Recommendations

This is a list of extensions for this library.

- VsCode Extensions
  - Iconify Intellisense
  - Icones
  - Uno Intellisense
  - Astro
  - Astro Snippets

To use the icons please go to [Icones](https://icones.netlify.app/) for a long list of icons.

For more information on `@forastro/flow` and `@forastro/utilities` go [here](https://forastro-docs.onrender.com)
