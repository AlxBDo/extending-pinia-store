import type { Store } from "pinia"
import type { Comparison } from "./comparison"

export interface CollectionState<T extends object = Record<string, unknown>> {
    items: T[]
}

export interface CollectionStoreMethods<T extends object = Record<string, unknown>> {
    addItem: (item: T) => void
    clear: () => void
    getItem: (criteria: Partial<T>) => T | undefined
    getItems: (criteria?: Partial<T>, comparisonMode?: Comparison) => T[]
    removeItem: (item: T) => void
    setItems: (items: T[]) => void
    updateItem: (updatedItem: T, oldItem?: T) => void
}

export type CollectionStoreInstance<T extends object = Record<string, unknown>> =
    Store<string, CollectionState<T>> & CollectionStoreMethods<T>

export interface SearchCollectionCriteria {
    [key: number | string | symbol]: unknown;
}