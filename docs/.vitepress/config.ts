import {DefaultTheme, defineConfig} from 'vitepress'
import { toolKotlin, toolPython, workJava, workVue, myThink } from "./mySidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/note-kotlin/",
  title: "Roc Note",
  description: "学习笔记",

  cleanUrls: true,

  //markdown配置
  markdown: {
    //行号显示
    lineNumbers: false
  },

  //主题配置  https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    //导航栏
    nav: nav(),
    //侧边栏
    sidebar: {
      '/tool-kotlin/': { base: '/tool-kotlin/', items: toolKotlin },
      '/tool-python/': { base: '/tool-python/', items: toolPython },
      '/work-java/': { base: '/work-java/', items: workJava },
      '/work-vue/': { base: '/work-vue/', items: workVue },
      '/my-think/': { base: '/my-think/', items: myThink },
    },
    //社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    //页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023 备案号：<a href="https://beian.miit.gov.cn/">京****号</a>',
    },
    //
    outline: {
      level: [2, 6],
      label: '目录'
    }
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'work',
      activeMatch: `^/(work-java|work-vue)/`,
      items: [
        { text: 'Java', link: '/work-java/0release' },
        { text: 'Vue', link: '/work-vue/00' },
      ]
    },
    {
      text: 'tool',
      activeMatch: `^/(tool-kotlin|tool-python)/`,
      items: [
        { text: 'kotlin', link: '/tool-kotlin/01-Kotlin-what-and-why' },
        { text: 'python', link: '/tool-python/00' },
      ]
    },
    { text: 'think', link: '/my-think/0vitepress', activeMatch: '/my-think/' },
  ]
}
