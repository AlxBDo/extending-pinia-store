import { defineStore } from "pinia";
import type { ResourceId } from "../types/resourceId";

export const useResourceIdStore = (id: string) => defineStore(id, {
    state: (): ResourceId => ({
        "@id": undefined,
        id: undefined
    }),

    actions: {
        setData(data: Partial<ResourceId>) {
            if (data['@id']) { this['@id'] = data['@id'] }
            if (data.id) { this.id = data.id }
        }
    }
})()