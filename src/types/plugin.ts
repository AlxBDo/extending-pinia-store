import ParentStoreClass from "../plugins/parentStore"

import type { StateTree, Store } from "pinia"
import type { CustomStore } from "pinia-plugin-subscription"
import type { ExtendedStoreOptions } from "./store"

export type ParentStoreResult<TStore extends object, TState extends StateTree> =
    CustomStore<TStore, TState> | Store

export interface ParentStoreInterface<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> {
    get id(): string
    build: (childId?: string) => ParentStoreResult<TStore, TState>
}


export type ParentStore<TStore extends object = Record<string, never>, TState extends StateTree = StateTree> =
    (id: string) => ParentStoreResult<TStore, TState>

export type ParentStoreConstructor<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> = (() => ParentStoreResult<TStore, TState>) | ParentStoreClass<TStore, TState>

export interface PluginStoreOptions extends ExtendedStoreOptions {
    storeOptions?: ExtendedStoreOptions
}