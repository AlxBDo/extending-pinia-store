import type { Store } from "pinia"
import type { CustomStore } from "pinia-plugin-subscription"

const stores: Map<string, Store> = new Map<string, Store>()

export function addStore(store: Store) {
    stores.set(store.$id, store)
}

export function getStore<TStore, TState>(storeId: string): CustomStore<TStore, TState> {
    return stores.get(storeId) as CustomStore<TStore, TState>
}