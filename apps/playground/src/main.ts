import { createApp } from 'vue'
import AppVue from './App.vue'

// cesium 静态资源由 plugins/cesium.ts 从 npm 包同步到 public/cesium
Object.assign(window, { CESIUM_BASE_URL: '/cesium/' })

const app = createApp(AppVue)
app.mount('#app')
