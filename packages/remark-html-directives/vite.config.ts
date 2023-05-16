import {defineConfig} from "vite"
import dts from "vite-plugin-dts"
export default defineConfig({
    build:{
        lib: {
            entry: "src/index.ts",
            name: "remarkHTMLDirectives",
            fileName: "remark-html-directives"
            
        }
    },
    plugins:[
        dts({insertTypesEntry:true})
    ]
})