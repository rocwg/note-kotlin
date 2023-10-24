//侧边栏
// items: DefaultTheme.SidebarItem[]

export const myThink = [
    { text: 'VitePress 使用心得', link: '0vitePress' },
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
            { text: 'java-thread', link: 'spring/java-thread' },
            { text: 'java-stream', link: 'spring/java-stream' },
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
    { text: 'FxGl', link: 'FxGl' },
    { text: 'KMP', link: 'KMP' },
]

export const bookKinA = [
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

export const bookBlender = [
    { text: '00', link: '00' },
    {
        text: 'Getting Started',
        items: [
            { text: 'G0-AboutBlender', link: 'G0-AboutBlender' },
            { text: 'G1-Installing', link: 'G1-Installing' },
            { text: 'G2-Configuring', link: 'G2-Configuring' },
            { text: 'G3-HelpSystem', link: 'G3-HelpSystem' },
        ]
    },
    {
        text: 'Sections',
        items: [
            { text: 'S0-UserInterface', link: 'S0-UserInterface' },
            { text: 'S1-Editors', link: 'S1-Editors' },
            { text: 'S2-Scenes&Objects', link: 'S2-Scenes&Objects' },
            { text: 'S3-Modeling', link: 'S3-Modeling' },
            { text: 'S4-Sculpting&Painting', link: 'S4-Sculpting&Painting' },
            { text: 'S5-GreasePencil', link: 'S5-GreasePencil' },
            { text: 'S6-Animation&Rigging', link: 'S6-Animation&Rigging' },
            { text: 'S7-Physics', link: 'S7-Physics' },
            { text: 'S8-Rendering', link: 'S8-Rendering' },
            { text: 'S9-Compositing', link: 'S9-Compositing' },
            { text: 'S10-MotionTracking&Masking', link: 'S10-MotionTracking&Masking' },
            { text: 'S11-VideoEditing', link: 'S11-VideoEditing' },
            { text: 'S12-Assets-Files-DataSystem', link: 'S12-Assets-Files-DataSystem' },
            { text: 'S13-Add-ons', link: 'S13-Add-ons' },
            { text: 'S14-Advanced', link: 'S14-Advanced' },
            { text: 'S15-Troubleshooting_Glossary_ManualIndex', link: 'S15-Troubleshooting_Glossary_ManualIndex' },
        ]
    },
]


// 这种方式重命名不能同步到相关调用的地方。
// export default { toolKotlin, toolPython, workJava, workVue, myThink }
