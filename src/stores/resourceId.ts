import { ref } from "vue";
import { defineAStore } from "pinia-plugin-subscription";
import type { ResourceId } from "../types/resourceId";


export const useResourceIdStore = (id: string) => defineAStore(id, () => {
    const atId = ref<string | undefined>()
    const id = ref<string | number | undefined>()

    function setData(data: Partial<ResourceId>) {
        if (data['@id']) { atId.value = data['@id'] }
        if (data.id) { id.value = data.id }
    }

    return {
        "@id": atId,
        id,
        setData
    }
}, { overrideReset: true })()