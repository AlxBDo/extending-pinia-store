import StoreExtension from "../core/StoreExtension";
import { PluginSubscriber } from "pinia-plugin-subscription/helpers";
import { PluginConsole } from "../utils/pluginConsole";
import type { ExtendedStoreActions } from "../types/store";
import { pluginName } from "../utils/constantes";
import type { Store } from "pinia";


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
