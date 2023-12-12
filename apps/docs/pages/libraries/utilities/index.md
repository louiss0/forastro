---
next:
   text: Iteration Functions
   link: /libraries/utilities/iteration-functions
---

<!-- markdownlint-disable-next-line MD033 -->
# Utilities <Badge type="info" text="4.3.7"  />

The `@forastro/utilities` package is a package that has practical functions and components
that are used for development with [Astro.js](https://astro.build).

:::info This library gives you the following kinds of tools

- Range functions
- Iteration functions
- Template projection
- Condition evaluation functions
- Error Functions
- Content Collection Helpers

:::

:::danger
 The components that are used by the package are Server Components.
:::

:::code-group

 ```[pnpm] shell
    pnpm add @forastro/utilities
 ```

 ```[yarn] shell
    yarn add @forastro/utilities
 ```

 ```[npm] shell
    npm i @forastro/utilities
 ```

:::

::: warning You must now set `vite.optimizeDeps.exclude` to `["astro:content"]` in astro config.
  This library now uses `astro:content` to expand it's API's
  to give devs a much better experience when using `getCollections()`.
  Unfortunately this is the cost.

```ts
// astro.config.mjs
  export default {
   vite: {  //[!code ++]
      optimizeDeps:{  //[!code ++]
         exclude: ["astro:content"] //[!code ++]
      } //[!code ++]
   } //[!code ++]
  }
```

:::

## Recommendations

I think it a good idea to pair this library with

- [ts-pattern](https://www.npmjs.com/package/ts-pattern).
  - You can try [pattycake](https://www.npmjs.com/package/pattycake) with it.
- [tiny-invariant](https://www.npmjs.com/package/tiny-invariant)
- [ts-reset](https://www.npmjs.com/package/@total-typescript/ts-reset)
- [remeda](https://www.npmjs.com/package/remeda)
