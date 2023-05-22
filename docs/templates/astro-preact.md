# For Astro Preact Template

This template is a template for creating sites built with Astro and Preact. It uses `@forastro/utilities` for Astro support.
It uses a class library called `clsx`. The table below should tell you more.

| Type          | Name       |
| ------------- | ---------- |
| CSS Framework | Tailwind   |
| Icon Library  | Iconify    |
| Font Library  | Fontsource |

## Start Command

**To start the app use:**

:::code-group

```[pnpm]
pnpm run start 
```

```[npm]
npm run start 
```

```[yarn]
yarn run start 
```

:::

## Main Folders

- components - for components
- utilities for - constants, util functions, and types.
- layouts
- pages  

## Configuration

There are only two config files in this repo. `astro.config` and `tailwind.config`. I will split this into two sections.

The `Default.astro` file contains the main stylesheet for tailwind. The CSS Variables come from a website called [Utopia](https://utopia.fyi/) which is a site that is good for using typography and fluid spacing. I decided to use a 12 - 16 font range with a transition from a minor third to a major third.

The `--heading-font` variable is used for headings the `--body-font` variable is used for the body. The step variables are used in the Typography component.

### Astro Config

For the astro config `astro-assets` are activated. Iconify for Preact is activated with `compiler: 'jsx', jsx: 'preact'`.  

### Tailwind Config

Tailwind is configured to use dark mode class `vue-use` needs this so that it can trigger dark mode. The safelisted classes are `hidden, fixed, translate-x-full, translate-y-full, opacity-0`. This is so that no one ever has to turn them on per project. Most of the time hidden and fixed will be used but, I have found that the translate classes can be used in some projects to make it so that something moves in a specific direction.

## Recommendations

This is a list of extensions for this library.

- VsCode Extensions
  - Tailwind Intellisense
  - Astro
  - Astro Snippets
  - Icones
  - Iconify Intellisense
  - TS?X Snippets

To use the icons please go to [Icones](https://icones.netlify.app/) for a long list of icons.
