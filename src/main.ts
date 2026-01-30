import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { createPlugin, PLUGIN_NAME as PPS } from 'pinia-plugin-subscription'
import ExtendsPiniaStore from './plugins/ExtendsPiniaStore'
import { pluginName } from './utils/constantes'

const app = createApp(App)
const pinia = createPinia()
pinia.use(createPlugin([ExtendsPiniaStore], [PPS, pluginName, 'PluginSubscription']))

app.use(pinia)
app.mount('#app')
