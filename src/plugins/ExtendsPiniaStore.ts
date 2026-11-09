import StoreExtension from "../core/StoreExtension";
import { PluginSubscriber } from "pinia-plugin-subscription/helpers";
import type { ExtendedStoreActions, ExtendedStoreOptions } from "../types/store";
import { pluginName } from "../utils/constants";
import type { Store } from "pinia";


class ExtendsPiniaStore extends PluginSubscriber<StoreExtension> {
    constructor() {
        super(
            pluginName,
            StoreExtension.customizeStore.bind(StoreExtension)
        )
    }
}

export default new ExtendsPiniaStore();

declare module 'pinia-plugin-subscription/types' {
    interface StoreOptionsExtensions extends Omit<ExtendedStoreOptions, 'propertiesToRename' | 'actionsToRename'> {
    }
}