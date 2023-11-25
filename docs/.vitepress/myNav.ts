//导航栏
// DefaultTheme.NavItem[]

import {DefaultTheme} from "vitepress/types/default-theme";

export const myNav: DefaultTheme.NavItem[] = [
    {
        text: 'work',
        link: '',
        activeMatch: `^/(work-java|work-vue)/`,
        items: [
            { text: 'Java', link: '/work-java/0release' },
            { text: 'Vue', link: '/work-vue/00' },
        ]
    },
    {
        text: 'tool',
        link: '',
        activeMatch: `^/(tool-kotlin|tool-python)/`,
        items: [
            { text: 'kotlin', link: '/tool-kotlin/FxGl' },
            { text: 'python', link: '/tool-python/00' },
        ]
    },
    {
        text: 'book',
        link: '',
        activeMatch: `^/(itBook)/`,
        items: [
            { text: 'KinA', link: '/itBook/KinA/01-Kotlin-what-and-why' },
            { text: 'Blender', link: '/itBook/blender4manual/00' },
        ]
    },
    { text: 'think', activeMatch: '/my-think/' , link: '/my-think/0vitePress' },
]
