import type { PiniaPluginContext } from "pinia";
import StoreExtension from "../core/StoreExtension";
import { addStore } from "./stores";
import type { PluginStoreOptions, PluginSubscriber } from "pinia-plugin-subscription";

class ExtendsPiniaStore implements PluginSubscriber {
    invoke({ store, options }: PiniaPluginContext, debug: boolean = false) {
        const storeExtension = StoreExtension.customizeStore<StoreExtension>(
            store,
            options as unknown as PluginStoreOptions,
            debug
        )

        if (!storeExtension || !storeExtension.parentsStores) {
            return store
        }

        addStore(store)
    }
}

export default new ExtendsPiniaStore();