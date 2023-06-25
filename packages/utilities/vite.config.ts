
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';



export default defineConfig({
  cacheDir: '../../node_modules/.vite/utilities',

  plugins: [
    
  ],


  // Uncomment this if you are using workers. 
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },


  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest'
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

  },
});