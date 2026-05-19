import { AnyObject } from "pinia-plugin-subscription"
import { Comparison } from "./comparison"

export interface CollectionState<T> {
    items: T[]
}

export interface CollectionStoreMethods {
    addItem: (item: AnyObject) => void
    clear: () => void
    getItem: (criteria: SearchCollectionCriteria) => AnyObject | undefined
    getItems: (criteria?: SearchCollectionCriteria, comparisonMode?: Comparison) => AnyObject[]
    removeItem: (item: AnyObject) => void
    setItems: <T>(items: T[]) => void
    updateItem: (updatedItem: AnyObject, oldItem?: AnyObject) => void
}

export interface SearchCollectionCriteria {
    [key: number | string | symbol]: boolean | number | string;
}