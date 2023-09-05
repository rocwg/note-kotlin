//侧边栏
// items: DefaultTheme.SidebarItem[]

export const myThink = [
    { text: 'VitePress 使用心得', link: '0vitepress' },
    { text: '计划', link: '00' },
    { text: 'ENV', link: '01env' },
]

export const workJava = [
    { text: 'Java', link: '0Java' },
    { text: 'MySQL', link: '0mysql' },
    { text: 'release', link: '0release' },
    {
        text: 'spring',
        items: [
            { text: 'springBoot3', link: 'spring/springBoot3' },
        ]
    },
    {
        text: 'gradle',
        items: [
            { text: 'gradle-plugin', link: 'gradle/gradle-plugin' },
        ]
    },
    {
        text: 'toolJar',
        items: [
            { text: 'es', link: 'toolJar/es' },
        ]
    },
]

export const workVue = [
    { text: 'Vue3', link: '00' },
]

export const toolPython = [
    { text: 'Python', link: '00' },
]

export const toolKotlin = [
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



// 这种方式重命名不能同步到相关调用的地方。
// export default { toolKotlin, toolPython, workJava, workVue, myThink }
