# Astro Vue Base Template

This is the Astro vue Template that I use for my projects. The only page is the index html page.

Tailwind css is the CSS tool that I use for styling. Vue is the Component Renderer that I use for interactivity.

When it comes to components I just put them in the components folder. This template also uses `postcss-nesting` as it's nesting library for CSS. There are two packages that come with this template that will help `astro-gap` and `astro-template-outlet`. Astro Gap is good for creating spaces between elements. Astro Template Outlet is good for rendering template content.

This template also comes with `astro-icon` a library that is used for rendering icons. go to [icones](https://icones.js.org/) to find names for astro icon.

## Using the Project

To activate the server use.

```
p?npm start
```

To create a preview of the site.

```
p?npm preview
```

## Sections

[Project Folder Structure](#project-folder-structure)

[Config Files](#config-files)

[Bootstrapping the Application](#bootstrapping-the-application)

[Rules Regarding Projects](#rules-regarding-projects)

## [Project Folder Structure](#sections)

```
app__src
        |___layouts
        |___bootstrap
        |___components
        |___composables
        |___components
        |___stores
        |___types

```

## [Config Files](#sections)

There are three config files that are very important to keep the way they are.

- `tailwind.config.cjs`
- `astro.config.ts`
- `tsconfig.json`

### Tailwind Config

```js
{
darkMode: "class",
content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
safelist: [
    "hidden",
    "fixed",
    "translate-x-full",
    "translate-y-full",
    "opacity-0",
  ],
}
```

- The `darkMode:"class"` is used to enable the use of dark mode for most classes

- The `content:` allows tailwind to search for all files with classes in them in order to write them to the style sheet

- The `safelist:` is there so that these classes will be compiled in the final build. In most projects you will inevitably have to add or remove classes based on whether or not an element should appear or disappear. THese classes are the classses that will not be applied at first but will be when when a user clicks on a button to make something interactive.

### Astro Config

```ts
export default defineConfig({
  integrations: [
    tailwind(),
    vue({
      appEntrypoint: "/src/bootstrap",
      jsx: {
        enableObjectSlots: true,
      },
    }),
  ],
});
```

This configuration is required by tailwind to tell postcss to run the nesting plugin before tailwind

### [Bootstrapping the application](#sections)

The application relies on the `bootstrap/` folder to plan out how vue is used. When it comes to styling [Tailwind](https://tailwindcss.com/) is used

I created two layouts the BaseLayout and the HMFLayout. The BaseLayout is a layout that is used to set up all of the necessary styles and scripts for each page.
The HMFLayout is the one that should be used for most situations except when you don't need the navbar.

## [Rules Regarding Projects](#sections)

Astro is a framework that does not allow me to create real apps from now on I will need to follow a set of restrictions regarding This framework.  
Because of the limitations oof astro and the fact that I need to make sure that I remain consistent. I'm going to have to follow these rules.

1. The `BaseLayout` component is the root layout it will only be used to create other layouts

2. Global Styles must only be declared in the `BaseLayout` layout.

   - This means `<style is:global>` cannot be used on other layouts

3. The `index.astro` file must always be used to create all my first pages unless told otherwise

4. The articles that are written must be written by using `"remark-html-directives"`

5. New layouts will not change anything about The styles that were created in the `BaseLayout`

6. The `HMFLayout will not change under any circumstances`

7. The `HMFLayout only be used if Two slots are to be used`
