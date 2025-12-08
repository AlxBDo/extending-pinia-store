import ParentStoreClass from "../plugins/parentStore"

import type { Store } from "pinia"
import type { AnyObject, CustomStore, DefineAugmentedStore } from "pinia-plugin-subscription"
import type { ExtendedStoreOptions } from "./store"


interface ActionFlow {
    after?: Function | string
    before?: Function | string
}

export type ActionFlows = Record<string, ActionFlow>

export interface ParentStoreInterface {
    get id(): string
    build: (childId: string) => CustomStore<AnyObject, AnyObject>
}


export type ParentStore = (
    <TStore = AnyObject, TState = AnyObject>(id: string) => (DefineAugmentedStore<TStore, TState> | Store)
)

export type ParentStoreConstructor = (() => DefineAugmentedStore<AnyObject, AnyObject> | Store) | ParentStoreClass

export interface PluginStoreOptions { storeOptions: ExtendedStoreOptions }