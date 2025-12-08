import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { createPlugin } from 'pinia-plugin-subscription'
import ExtendsPiniaStore from './plugins/ExtendsPiniaStore'

const app = createApp(App)
const pinia = createPinia()
pinia.use(createPlugin([ExtendsPiniaStore]))

app.use(pinia)
app.mount('#app')
