import {DefaultTheme, defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "kotlin-in-action",
  description: "kotlin-in-action",

  //多语言
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    zh: {
      label: '简体中文',
      lang: 'Zh_CN',
      link: '/zh/',
    }
  },

  //markdown配置
  markdown: {
    //行号显示
    lineNumbers: true
  },

  //主题配置  https://vitepress.dev/reference/default-theme-config
  themeConfig: {

    //导航栏
    nav: nav(),

    //侧边栏
    sidebar: {
      '/': { base: '/', items: sidebarGuide() }
    },

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

function nav(): DefaultTheme.NavItem[] {
  return [
    {text: 'Home', link: '/'},
    {text: '01', link: '/01-Kotlin-what-and-why'}
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'PART 1: Introducing kotlin',
      collapsed: false,
      items: [
        { text: '1 kotlin: what and why', link: '01-Kotlin-what-and-why' },
        { text: '2 Kotlin basics', link: '02-Kotlin-basics' },
        { text: '03-Defining-and-calling-functions', link: '03-Defining-and-calling-functions' },
        { text: '04-Classes-objects-and-interfaces', link: '04-Classes-objects-and-interfaces' },
        { text: '05-Programming-with-lambdas', link: '05-Programming-with-lambdas' },
        { text: '06-Working-with-collections-and-sequences', link: '06-Working-with-collections-and-sequences' },
        { text: '07-Working-with-nullable-values', link: '07-Working-with-nullable-values' },
        { text: '08-BasicTypes-collections-and-arrays', link: '08-BasicTypes-collections-and-arrays' }
      ]
    },
    {
      text: 'PART 2: Embracing kotlin',
      collapsed: false,
      items: [
        { text: '09-Operator-overloading-and-other-conventions', link: '09-Operator-overloading-and-other-conventions' },
        { text: '10-Higher_order-functions-lambdas-as-parameters-and-returnValues', link: '10-Higher_order-functions-lambdas-as-parameters-and-returnValues' },
        { text: '11-Generics', link: '11-Generics' },
        { text: '12-Annotations-and-reflection', link: '12-Annotations-and-reflection' },
        { text: '13', link: '13' },
      ]
    },
    {
      text: 'APPENDIXES',
      collapsed: false,
      items: [
        { text: 'A: Building kotlin projects', link: 'Appendix-A' },
        { text: 'B: Documenting kotlin code', link: 'Appendix-B' },
      ]
    }
  ]
}
