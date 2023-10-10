import { defineConfig } from 'vitepress'
import vueNestedSFC from 'vite-plugin-vue-nested-sfc';
// https://vitepress.dev/reference/site-config

const TEMPLATES = [
  { link: "/templates/astro-preact", text: "Preact" },
  { link: "/templates/astro-vue", text: "Vue" },
  { link: "/templates/astro-minimal", text: "Minimal" },
  { link: "/templates/astro-mdx", text: "MDX" },
  { link: "/templates/astro-markdoc", text: "Markdoc" },
]

const LIBRARIES = Object.freeze([
  "Flow",
  "Utilities",
  "Remark HTML Directives Integration",
])

export default defineConfig({
  vite: {
    plugins: [
      vueNestedSFC()
    ]
  },
  srcDir: "./pages",
  title: "Home",
  titleTemplate: "For Astro",
  description: "A VitePress Site",
  cleanUrls: true,
  themeConfig: {

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Templates',
        items: TEMPLATES
      },
      {
        text: 'Libraries',
        items: [
          { link: "/libraries/flow/index", text: LIBRARIES[0] },
          {
            link: "/libraries/remark-html-directives/index",
            text: LIBRARIES[3]
          },
          { link: "/libraries/utilities/index", text: LIBRARIES[1] }
        ]
      },
    ],

    sidebar: [
      {
        text: 'Libraries',
        items: [
          {
            collapsed: false,
            text: LIBRARIES[0],
            items: [
              { text: "For", link: "/libraries/flow/for" },
              { text: "Switch And Case", link: "/libraries/flow/switch-and-case" },
              { text: "Show And Hide", link: "/libraries/flow/show-and-hide" },
              { text: "Range", link: "/libraries/flow/range" },
            ]
          },
          {
            text: LIBRARIES[1],
            collapsed: false,
            items: [
              { text: "Iteration Generators", link: "/libraries/utilities/iteration-generators" },
              { text: "Range Generators", link: "/libraries/utilities/range-generators" },
              { text: "Conditional Functions", link: "/libraries/utilities/conditional-functions" },
              { text: "Error Functions", link: "/libraries/utilities/error-functions" },
              { text: "Template Projection", link: "/libraries/utilities/template-projection" },
              {
                text: "Get Collection Helpers",
                link: "/libraries/utilities/get-collection-helpers"
              },
              { text: "Miscellaneous", link: "/libraries/utilities/miscellaneous" },
            ]
          },
          {
            text: LIBRARIES[3],
            collapsed: false,
            items: [
              {
                text: "Introduction",
                link: "/libraries/remark-html-directives/index",
              },
              {
                text: "Tags",
                link: "/libraries/remark-html-directives/tags",
              },

            ]
          },
        ]
      },
      {
        text: 'Templates',
        items: TEMPLATES
      },
    ],
    footer: {
      message: "All Libraries are MIT",
      copyright: "Copyright 2023-present by Shelton Louis"
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/louiss0/forastro' }
    ]
  }
})
