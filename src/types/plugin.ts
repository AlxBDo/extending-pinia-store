import ParentStoreClass from "../plugins/parentStore"

import type { StateTree, Store } from "pinia"
import type { CustomStore } from "pinia-plugin-subscription"
import type { ExtendedStoreOptions, ParentStoreOptions } from "./store"

export type ParentStoreResult<TStore extends object, TState extends StateTree> =
    CustomStore<TStore, TState> | Store

export interface ParentStoreInterface<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> {
    get id(): string
    get options(): ParentStoreOptions | undefined
    build: (childId?: string) => ParentStoreResult<TStore, TState>
}


export type ParentStore<TStore extends object = Record<string, never>, TState extends StateTree = StateTree> =
    (id: string) => ParentStoreResult<TStore, TState>

export type ParentStoreConstructor<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> = (() => ParentStoreResult<TStore, TState>) | ParentStoreClass<TStore, TState>

export interface PluginStoreOptions {
    storeOptions?: Omit<ExtendedStoreOptions, 'propertiesToRename' | 'actionsToRename'> & {
        /** @Deprecated use ParentStoreOptions instead */
        actionsToRename?: Record<string, string>
        /** @Deprecated use ParentStoreOptions instead */
        propertiesToRename?: Record<string, string>
    }
}