import DefaultTheme from 'vitepress/theme'
import {EnhanceAppContext} from "vitepress/dist/client";
// 定制CSS
import './styles/index.css'
// @ts-ignore
import ShowL from '../../components/ShowL.vue'
// @ts-ignore
import ShowS from '../../components/ShowS.vue'

export default {
    extends: DefaultTheme,
    enhanceApp(ctx: EnhanceAppContext) {
        // register your custom global components
        ctx.app.component('ShowL', ShowL)
        ctx.app.component('ShowS', ShowS)
    }
}
