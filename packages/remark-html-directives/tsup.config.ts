import { defineConfig } from 'tsup'

export default defineConfig((ctx)=> ({
  entry: ['src/index.ts'],
  splitting: false,
  format: !ctx.watch ? ["cjs", "esm"] : "cjs", 
  dts: !ctx.watch,
  minify: !ctx.watch,
  clean: !ctx.watch,
}))