import type { StateTree } from "pinia";
import type { Ref } from "vue";
import type { CustomStore } from "pinia-plugin-subscription";
import type { ParentStoreInterface } from "./plugin";


export interface ExtendedStoreActions {
    resetParentStores: () => void
}

export interface ExtendedStoreOptions {
    actionsToExtends?: string[]
    actionsToRename?: Record<string, string>
    childId?: string
    parentsStores?: ParentStoreInterface[]
    propertiesToRename?: Record<string, string>
}

export interface ExtendedState {
    isExtended?: boolean | Ref<boolean | undefined>
    isOptionApi?: boolean | Ref<boolean | undefined>
}

export type ExtendedStore<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> = CustomStore<TStore, TState> & ExtendedStoreOptions & ExtendedStoreActions