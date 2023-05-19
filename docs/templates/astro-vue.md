# For Astro Vue Template

This template is a template that is useful for building simple websites. With bits of interactivity throughout each stage of development. The table below should show you what tools are used in the app. All the things that are required for vue are installed. You can Auto import other Vue Components from inside of an island. This template also contains a set of practical components that will allow you to create websites faster in a practical way.

The `@forastro/utilities` package is featured here so that you can use it for pages. It's useful for solving common challenges with astro. Remember that the components used are in-fact astro components.

| Type                | Name       |
| ------------------- | ---------- |
| CSS Framework       | Tailwind   |
| Icon Library        | Iconify    |
| Font Library        | Fontsource |
| Vue Utility Library | Vue Use    |

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
- composables - for composables
- utilities for - constants, util functions, and types.
- layouts
- pages  

## Configuration

There are only two config files in this repo. `astro.config` and `tailwind.config`. I will split this into two sections.

The `Default.astro` file contains the main stylesheet for tailwind. The CSS Variables come from a website called [Utopia](https://utopia.fyi/) which is a site that is good for using typography and fluid spacing. I decided to use a 12 - 16 font range with a transition from a minor third to a major third.

The `--heading-font` variable is used for headings the `--body-font` variable is used for the body. The step variables are used in the Typography component.

### Astro Config

The astro config uses the astro and the vue integrations. Object Slots are enabled for JSX. Iconify and the auto importing of vue components are configured for vite in plugins.

### Tailwind Config

Tailwind is configured to use dark mode class `vue-use` needs this so that it can trigger dark mode. The safelisted classes are `hidden, fixed, translate-x-full, translate-y-full, opacity-0`. This is so that no one ever has to turn them on per project. Most of the time hidden and fixed will be used but, I have found that the translate classes can be used in some projects to make it so that something moves in a specific direction.

## Recommendations

This is a list of extensions for this library.

- VsCode Extensions
  - Iconify Intellisense
  - Icones
  - Volar
  - Tailwind Intellisense
  - Astro
  - Astro Snippets

To use the icons please go to [Icones](https://icones.netlify.app/) for a long list of icons.

### Warnings
  
Don't use pinia at all it's not worth it. An island is a new Vue app instance. The state will not be shared across components at all. Instead use `useSharedComposable`. If you feel like you need pinia then just use Nuxt.

When it comes to using icons remember `[prefix]-[icon pack]-[icon name]`.

- The **prefix** is **i**.
- The **icon name** is the name of the icon.
- THe **icon pack** is the pack of the
