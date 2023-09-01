import './styles/index.css'
import DefaultTheme from 'vitepress/theme'
import {EnhanceAppContext} from "vitepress/dist/client";
// @ts-ignore
import ShowL from '../../components/ShowL.vue'
// @ts-ignore
import ShowS from '../../components/ShowS.vue'

export default {
    extends: DefaultTheme,
    enhanceApp(ctx: EnhanceAppContext) {
        // register your custom global components
        ctx.app.component('ShowL', ShowL),
        ctx.app.component('ShowS', ShowS)
    }
}
