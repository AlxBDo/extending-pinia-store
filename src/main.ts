import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { createPlugin, PLUGIN_NAME as PPS } from 'pinia-plugin-subscription'
import { createTracerRegistry, createTraceGroupsRegistry, createConsoleTraceListener } from 'pinia-plugin-subscription/helpers'
import ExtendsPiniaStore from './plugins/ExtendsPiniaStore'
import { pluginName } from './utils/constantes'

const app = createApp(App)
const pinia = createPinia()

const tracerRegistry = createTracerRegistry()
const traceGroupsRegistry = createTraceGroupsRegistry()

pinia.use(
    createPlugin(
        [ExtendsPiniaStore],
        { tracerHandler: traceGroupsRegistry.tracerHandler }
    )
)

traceGroupsRegistry.addListener([{
    target: 'scope',
    value: 'lists'
}])

tracerRegistry.addTraceListener({
    ...createConsoleTraceListener(),
    filter: event => {
        //console.log(event)
        return event.scope === 'lists'
    }
})

app.use(pinia)
app.mount('#app')
