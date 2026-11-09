import { ref } from "vue"
import { defineAStore } from "pinia-plugin-subscription";
import { arrayObjectFindAllBy, arrayObjectFindBy } from '../utils/object'
import type { Comparison } from "../types/comparison";
import type { CollectionState, SearchCollectionCriteria } from "../types/collection";


type CollectionItem = Record<string, unknown>

function getItemCriteria(item: CollectionItem): SearchCollectionCriteria {
    return item.id ? { id: item.id } : { '@id': item['@id'] }
}


export const useCollectionStore = (id?: string) => defineAStore(id ?? 'collectionStore', () => {
    const items = ref<CollectionItem[]>([])

    function addItem(item: CollectionItem) {
        let foundedItem: CollectionItem | undefined

        if (item.id || item['@id']) {
            foundedItem = getItem(
                getItemCriteria(item)
            )

            if (foundedItem) {
                updateItem(item, foundedItem)
                return
            }
        }

        items.value.push(item)
    }

    function clear() {
        items.value = []
    }

    function getItem(criteria: Partial<CollectionItem>): CollectionItem | undefined {
        return arrayObjectFindBy<CollectionItem>(
            items.value,
            criteria
        )
    }

    function getItems(criteria?: Partial<CollectionItem>, comparisonMode: Comparison = 'strict'): CollectionItem[] {
        if (!criteria) {
            return items.value
        }

        return arrayObjectFindAllBy<CollectionItem>(
            items.value,
            criteria,
            comparisonMode
        )
    }

    function removeItem(item: CollectionItem) {
        items.value = items.value.filter((i) => i.id !== item.id)
    }

    function setItems(newItems: CollectionItem[]) {
        if (Array.isArray(newItems)) {
            items.value = newItems
        }
    }

    function updateItem(updatedItem: CollectionItem, oldItem?: CollectionItem) {
        if (!oldItem) {
            oldItem = getItem(getItemCriteria(updatedItem))
        }

        if (oldItem) {
            Object.assign(oldItem, updatedItem)
        }
    }

    return {
        addItem,
        clear,
        getItem,
        getItems,
        removeItem,
        setItems,
        updateItem
    }
}, { overrideReset: true })()