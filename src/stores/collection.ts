import { defineStore } from "pinia";
import { arrayObjectFindAllBy, arrayObjectFindBy } from '../utils/object'
import type { Comparison } from "../types/comparison";
import type { CollectionState, SearchCollectionCriteria } from "../types/collection";


type CollectionItem = Record<string, unknown>

function getItemCriteria(item: CollectionItem): SearchCollectionCriteria {
    return item.id ? { id: item.id } : { '@id': item['@id'] }
}


export const useCollectionStore = (id?: string) => defineStore(id ?? 'collectionStore', {
    state: (): CollectionState<CollectionItem> => ({
        items: []
    }),

    actions: {
        addItem(item: CollectionItem) {
            let foundedItem: CollectionItem | undefined

            if (item.id || item['@id']) {
                foundedItem = this.getItem(
                    getItemCriteria(item)
                )

                if (foundedItem) {
                    this.updateItem(item, foundedItem)
                    return
                }
            }

            this.items.push(item)
        },

        clear() {
            this.items = []
        },

        getItem(criteria: Partial<CollectionItem>): CollectionItem | undefined {
            return arrayObjectFindBy<CollectionItem>(
                this.items,
                criteria
            )
        },

        getItems(criteria?: Partial<CollectionItem>, comparisonMode: Comparison = 'strict'): CollectionItem[] {
            if (!criteria) {
                return this.items
            }

            return arrayObjectFindAllBy<CollectionItem>(
                this.items,
                criteria,
                comparisonMode
            )
        },

        removeItem(item: CollectionItem) {
            this.items = this.items.filter((i) => i.id !== item.id)
        },

        setItems(items: CollectionItem[]) {
            if (Array.isArray(items)) {
                this.items = items
            }
        },

        updateItem(updatedItem: CollectionItem, oldItem?: CollectionItem) {
            if (!oldItem) {
                oldItem = this.getItem(getItemCriteria(updatedItem))
            }

            if (oldItem) {
                Object.assign(oldItem, updatedItem)
            }
        }
    }
})()