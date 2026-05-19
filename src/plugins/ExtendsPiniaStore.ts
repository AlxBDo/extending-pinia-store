import StoreExtension from "../core/StoreExtension";
import { PluginSubscriber, PluginSubscriberInterface, StoreOptions } from "pinia-plugin-subscription";
import { PluginConsole } from "../utils/pluginConsole";
import { ExtendedStoreActions, ExtendedStoreOptions } from "../types/store";
import { pluginName } from "../utils/constantes";
import { Store } from "pinia";


class ExtendsPiniaStore extends PluginSubscriber<StoreExtension> {
    protected override _resetStoreCallback = (store?: Store) => {
        const { resetParentStores } = store as Store & ExtendedStoreActions;
        if (typeof resetParentStores === 'function') {
            resetParentStores()
        }
    }

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