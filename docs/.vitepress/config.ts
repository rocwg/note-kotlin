import {DefaultTheme, defineConfig} from 'vitepress'
import {toolKotlin, toolPython, workJava, workVue, myThink, bookKinA, bookBlender} from "./mySidebar";
import {myNav} from "./myNav";

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
    nav: myNav,
    //侧边栏
    sidebar: {
      '/work-java/': { base: '/work-java/', items: workJava },
      '/work-vue/': { base: '/work-vue/', items: workVue },
      '/tool-kotlin/': { base: '/tool-kotlin/', items: toolKotlin },
      '/tool-python/': { base: '/tool-python/', items: toolPython },
      '/my-think/': { base: '/my-think/', items: myThink },
      '/itBook/KinA/': { base: '/itBook/KinA/', items: bookKinA },
      '/itBook/blender4manual/': { base: '/itBook/blender4manual/', items: bookBlender },
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
