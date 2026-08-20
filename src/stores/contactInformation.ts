import { defineAStoreCtx, SearchCollectionCriteria, getEnhancedStore } from "pinia-plugin-subscription";
import { useCollectionStore } from './collection'
import ParentStore from '../plugins/parentStore'
import type { CollectionState, CollectionStoreMethods } from '../types/collection'
import type { ContactInformation, ContactInformationValue } from '../types/contactInformation'
import { computed } from "vue";


export const useContactInformationStore = (
    id: string
) => defineAStoreCtx<CollectionStoreMethods, CollectionState<ContactInformation>>(id, (ctx) => {
    const email = computed({
        get: () => getContactInformationValue('email'),
        set: (value: string) => addEmail('email', value)
    })

    const mobilePhone = computed({
        get: () => getContactInformationValue('mobile-phone'),
        set: (value: string) => addMobilePhone('mobile-phone', value)
    })

    const phone = computed({
        get: () => getContactInformationValue('phone'),
        set: (value: string) => addPhone('phone', value)
    })


    function addContactInformation(name: string, type: string, value: ContactInformationValue, id?: string | number): void {
        getStore().addItem({ id: id ?? name, name, type, value })
    }

    function addEmail(name: string, value: string, id?: string | number) {
        addContactInformation(name, 'email', value, id)
    }

    function addMobilePhone(name: string, value: string, id?: string | number) {
        addContactInformation(name, 'mobile-phone', value, id)
    }

    function addPhone(name: string, value: string, id?: string | number) {
        addContactInformation(name, 'phone', value, id)
    }

    function getContactInformation(criteria: SearchCollectionCriteria): ContactInformation | ContactInformation[] {
        return criteria.id
            ? (getStore().getItem(criteria) as ContactInformation)
            : (getStore().getItems(criteria) as ContactInformation[])
    }

    function getContactInformationValue(id: string): ContactInformationValue {
        return (getContactInformation({ id }) as ContactInformation)?.value
    }

    function getStore() {
        return getEnhancedStore<CollectionStoreMethods & CollectionState<ContactInformation>>(ctx)
    }


    return {
        addContactInformation,
        addEmail,
        addMobilePhone,
        addPhone,
        email,
        getContactInformation,
        getContactInformationValue,
        mobilePhone,
        phone
    }
}, {
    parentsStores: [new ParentStore(`${id}Collection`, useCollectionStore)]
})()