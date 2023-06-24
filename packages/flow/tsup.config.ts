import { defineConfig } from 'tsup'

export default defineConfig((ctx) => ({
  entry:["src/lib/helpers.ts"],
  publicDir: true,
  splitting: false,
  format: "esm",
  minify: !ctx.watch,
  clean: !ctx.watch,
}))