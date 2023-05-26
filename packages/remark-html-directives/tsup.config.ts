import { defineConfig } from 'tsup'

export default defineConfig((ctx)=> ({
  entry: ['src/index.ts'],
  splitting: false,
  format: ["cjs", "esm"], 
  dts: !ctx.watch,
  minify: !ctx.watch,
  clean: !ctx.watch,
}))