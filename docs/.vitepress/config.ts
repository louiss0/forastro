import { defineConfig } from 'vitepress'
import vueNestedSFC from 'vite-plugin-vue-nested-sfc';
// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [
      vueNestedSFC()
    ]
  },
  title: "Home",
  titleTemplate: "For Astro",
  description: "A VitePress Site",
  cleanUrls: true,
  themeConfig: {

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Templates',
        items: [
          { link: "/templates/preact-template", text: "Preact" },
          { link: "/templates/vue-template", text: "Vue" },
          { link: "/templates/minimal-template", text: "Minimal" }
        ]
      },
      {
        text: 'Libraries',
        items: [
          { link: "/libraries/flow/index", text: "Flow" },
          { link: "/libraries/remark-html-directives/index", text: "Remark HTML Directives" },
          { link: "/libraries/utilities/index", text: "Utilities" }
        ]
      },
    ],

    sidebar: [
      {
        text: 'Libraries',
        items: [
          {
            collapsed: false,
            text: "Flow",
            items: [
              { text: "For", link: "/libraries/flow/for" },
              { text: "Switch And Case", link: "/libraries/flow/switch-and-case" },
              { text: "Show And Hide", link: "/libraries/flow/show-and-hide" },
              { text: "Range", link: "/libraries/flow/range" },
            ]
          },
          {
            text: "Utilities",
            collapsed: false,
            items: [
              { text: "Iteration Generators", link: "/libraries/utilities/iteration-generators" },
              { text: "Range Generators", link: "/libraries/utilities/range-generators" },
              { text: "Conditional Functions", link: "/libraries/utilities/conditional-functions" },
              { text: "Template Projection", link: "/libraries/utilities/template-projection" },
              { text: "Page Link", link: "/libraries/utilities/page-link" },
            ]
          },
          { link: "/libraries/remark-html-directives/index", text: "Remark HTML Directives" },
        ]
      },
      {
        text: 'Templates',
        items: [
          { link: "/templates/preact-template", text: "Preact" },
          { link: "/templates/vue-template", text: "Vue" },
          { link: "/templates/minimal-template", text: "Minimal" }
        ]
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
