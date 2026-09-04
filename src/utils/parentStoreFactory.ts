import type { StateTree } from 'pinia';
import type { ParentStore as ParentStoreType } from '../types/plugin';
import type { ParentStoreOptions } from '../types/store';
import ParentStore from '../plugins/parentStore';

/**
 * Creates a new instance of the ParentStore class, wrapping the provided store instance.
 * @param id The unique identifier for the parent store.
 * @param store The store instance to be wrapped by the parent store.
 * @param storeOptions Optional configuration options for the parent store.
 * @returns A new instance of the ParentStore class.
 * @see ParentStore
 */
export function createParentStore<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
>(id: string, store: ParentStoreType<TStore, TState>, storeOptions?: ParentStoreOptions) {
    return new ParentStore(id, store, storeOptions);
}