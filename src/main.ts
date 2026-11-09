import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { createPlugin, PLUGIN_NAME as PPS } from 'pinia-plugin-subscription'
import { createTraceDevtools } from 'pinia-plugin-subscription-devtools'
import { StateSnapshotsSubscriber } from "pinia-plugin-state-snapshots"
import ExtendsPiniaStore from './plugins/ExtendsPiniaStore'

const app = createApp(App)
const pinia = createPinia()

const { registry } = createTraceDevtools()
StateSnapshotsSubscriber.overrideReset = true

pinia.use(
    createPlugin(
        [ExtendsPiniaStore, StateSnapshotsSubscriber],
        { tracerHandler: registry.tracerHandler }
    )
)

app.use(pinia)
app.mount('#app')
