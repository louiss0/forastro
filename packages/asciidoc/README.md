# For Astro Asciidoc

This library is a set of tools that are designed to work with Asciidoc.
The main focus of this library is to use and configure a tool called the Asciidoc loader.
The loader is the tool that is responsible for extracting info from Asciidoc files.
This library also comes with some nice tools to help you work with Asciidoc.

## Usage

To install the library all you have to do is use your favorite package manager.

To use this library all you have to do is import `asciidocLoader` from `@forastro/asciidoc`.

```ts
import { asciidocLoader } from "@forastro/asciidoc" 
```

Then go to the content collection file in Astro's file and type this.

```ts
  import {asciidocLoader} from "@forastro/asciidoc"
  import { z defineCollection } from 'astro:content'

   const topic defineCollection({
        loader: asciidocLoader("src/data")
        schema: z.object({
            doctitle: z.string()
        })
        .transform((it)=> ({
            title: it.doctitle
        }))
    })

    export  const collections = {
        topic
    }

```

This should get you setup with Astro. This integration does provide it's own schema.
It's called the `asciidocBaseSchema` It's a schema that extract's properties from Asciidoc files.
Then transform's them into objects that are written in camelCase forms.
The title will come from Asciidoc's `doctitle` property always.

The object that is parsed is this type.

```ts
{
    author: string;
    authors: string[];
    description: string;
    email?: string | undefined;
    title: string;
    authorInitials: string;
    firstName: string;
    middleName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
}
```

To use this schema all you have to do is import it from `@forastro/asciidoc`.
Then use it in define collections.

```ts
  import {asciidocLoader, asciidocBaseSchema } from "@forastro/asciidoc"
  import { defineCollection } from 'astro:content'

   const topic defineCollection({
        loader: asciidocLoader("src/data")
        schema: asciidocBaseSchema
    })

    export const collections = {
        topic
    }

```

## Configuration

If you're a asciidoc user from a different language then I need you to know that.
For now you will not be able to use extensions from the Asciidoc ecosystem yet.
This config file exists so that users can create their own blocks and macros.
The config file will also allow you to register attributes that will be sent to all Asciidoc files.

You must create a config file at the root of your project that is an `asciidoc.config` file.
With either an `.mjs` or `.mts` file. Any other extension will give out an error.

The config file takes the following properties.

- `attributes:` An object literal of global attributes that are allowed to be applied to each document.
- `blocks:` An object literal that takes in keys with and name whose values must be two an object literal with two props.
  - `context` The context for the block.
  - `render` The function that will render the content that will be displayed
- `macros:` An object literal that takes `inline:` and `block:` as properties.
  - The `inline:` and `block:` props both take in an object literal that must provide props
    Who's values are an object literal with both `context:` and `render:`.

Remember to `export default` the config file.
If you need help with the types please use the config file use the `AsciidocConfigObject` type.
