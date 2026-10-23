import { createApp } from 'vue'
import AppVue from './App.vue'

// cesium 静态资源由 plugins/cesium.ts 从 npm 包同步到 public/cesium
// 使用 BASE_URL，兼容部署在子路径（如 GitHub Pages）的场景
Object.assign(window, { CESIUM_BASE_URL: `${import.meta.env.BASE_URL}cesium/` })

const app = createApp(AppVue)
app.mount('#app')
