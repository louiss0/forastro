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
          { link: "/templates/minimal-template", text: "minimal" }
        ]
      },
      {
        text: 'Libraries',
        items: [
          { link: "/libraries/flow/index", text: "Flow" },
          { link: "/libraries/remark-html-directives/index", text: "Remark HTML Directives" },
          { link: "/libraries/utilities", text: "Utilities" }
        ]
      },
    ],

    sidebar: [
      {
        text: 'Libraries',
        items: [
          {
            text: "Flow",
            items: [
              { text: "For", link: "/libraries/flow/for" }
            ]
          },
          { link: "/libraries/utilities", text: "Utilities" },
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
