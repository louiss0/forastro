import { defineConfig } from 'vitest/config';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    cacheDir: "../../node_modules/.vite/markdoc-html-tags",
    plugins: [
        viteTsConfigPaths({
            root: "../../",

        })
    ],
    test: {
        globals: true,
        cache: {
            dir: '../../node_modules/.vitest'
        },
        setupFiles: "src/test/setup/index.ts",
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    }
})
