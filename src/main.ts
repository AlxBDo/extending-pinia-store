import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { createPlugin, PLUGIN_NAME as PPS } from 'pinia-plugin-subscription'
import { createTracerRegistry } from 'pinia-plugin-subscription/helpers'
import ExtendsPiniaStore from './plugins/ExtendsPiniaStore'
import { pluginName } from './utils/constants'

const app = createApp(App)
const pinia = createPinia()

const tracerRegistry = createTracerRegistry()

pinia.use(
    createPlugin(
        [ExtendsPiniaStore],
        { tracerHandler: tracerRegistry.tracerHandler }
    )
)

tracerRegistry.addScopesListener(['rollbackSnapshotStoreWithRollback', 'lists', 'newContactStore'])

app.use(pinia)
app.mount('#app')
