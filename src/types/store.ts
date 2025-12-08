import type { _StoreWithGetters } from "pinia";
import type { Ref } from "vue";
import type { CustomStore } from "pinia-plugin-subscription";
import type { ActionFlows, ParentStoreInterface } from "./plugin";


export interface ExtendedStoreOptions {
    actionFlows?: ActionFlows
    actionsToExtends?: string[]
    actionsToRename?: Record<string, string>
    parentsStores?: ParentStoreInterface[]
    propertiesToRename?: Record<string, string>
}

export interface ExtendedState {
    isExtended?: boolean | Ref<boolean | undefined>
    isOptionApi?: boolean | Ref<boolean | undefined>
}

export type ExtendedStore<TStore, TState> = CustomStore<TStore, TState> & ExtendedStoreOptions