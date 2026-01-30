import StoreExtension from "../core/StoreExtension";
import { PluginSubscriber, StoreOptions } from "pinia-plugin-subscription";
import { PluginConsole } from "../utils/pluginConsole";
import { ExtendedStoreOptions } from "../types/store";
import { pluginName } from "../utils/constantes";


class ExtendsPiniaStore extends PluginSubscriber<StoreExtension> {
    constructor() {
        super(
            pluginName,
            StoreExtension.customizeStore.bind(StoreExtension),
            PluginConsole
        )
    }
}

export default new ExtendsPiniaStore();


declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        storeOptions?: ExtendedStoreOptions & StoreOptions
    }
}