import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { IdentityState } from "../types/identity"


export const useIdentityStore = (id: string) => defineStore(id, () => {
    const birthname = ref<string | undefined>()
    const firstname = ref<string | undefined>()
    const gender = ref<string | undefined>()
    const lastname = ref<string | undefined>()


    const fullname = computed(() => `${firstname.value} ${lastname.value}`)


    function getFullname() {
        return `${firstname.value} ${lastname.value}`
    }

    function setData(identity: IdentityState): void {
        if (identity.birthname) { birthname.value = identity.birthname }
        if (identity.firstname) { firstname.value = identity.firstname }
        if (identity.gender) { gender.value = identity.gender }
        if (identity.lastname) { lastname.value = identity.lastname }
    }


    return {
        birthname,
        firstname,
        fullname,
        gender,
        getFullname,
        lastname,
        setData
    }
})()