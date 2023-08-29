import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vitepress-doc-zh",
  description: "vitepress-doc-zh",

  //主题配置  https://vitepress.dev/reference/default-theme-config
  themeConfig: {

    //导航栏
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    //侧边栏
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    //编辑本页
    // editLink: {
    //   pattern: 'https://github.com/vuejs/vitepress/edit/main/docs/:path',
    //   text: 'Edit this page on GitHub'
    // },

    //社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    //页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023 备案号：<a href="https://beian.miit.gov.cn/">京****号</a>',
    },

    //本地搜索
    // search: {
    // },
  }
})
