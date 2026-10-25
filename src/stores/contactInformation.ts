import { defineAStoreCtx, getEnhancedStore } from "pinia-plugin-subscription";
import { useCollectionStore } from './collection'
import ParentStore from '../plugins/parentStore'
import type { CollectionState } from '../types/collection'
import type { ContactInformation, ContactInformationState, ContactInformationStore, ContactInformationValue } from '../types/contactInformation'
import type { SearchCollectionCriteria } from '../types/collection'
import { computed } from "vue";


export const useContactInformationStore = (
    id: string
) => defineAStoreCtx<ContactInformationStore, CollectionState<ContactInformation>>(id, (ctx) => {
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


    function addContactInformation(name: string, type: string, value: ContactInformationValue, id?: number): void {
        getStore().setContactInformationItem({ id: id ?? name, name, type, value })
    }

    function addEmail(name: string, value: string, id?: number) {
        addContactInformation(name, 'email', value, id)
    }

    function addMobilePhone(name: string, value: string, id?: number) {
        addContactInformation(name, 'mobile-phone', value, id)
    }

    function addPhone(name: string, value: string, id?: number) {
        addContactInformation(name, 'phone', value, id)
    }

    function getContactInformation(criteria: SearchCollectionCriteria): ContactInformation | ContactInformation[] | undefined {
        return criteria.id
            ? getStore().getContactInformationItem(criteria)
            : getStore().getContactInformations(criteria)
    }

    function getContactInformationValue(id: string): ContactInformationValue | undefined {
        return (getContactInformation({ id }) as ContactInformation | undefined)?.value
    }

    function getStore() {
        return getEnhancedStore<ContactInformationStore & CollectionState<ContactInformation>>(ctx)
    }

    function setData(data: ContactInformationState) {
        if (data.email) {
            addEmail('email', data.email)
        }
        if (data.mobilePhone) {
            addMobilePhone('mobile-phone', data.mobilePhone)
        }
        if (data.phone) {
            addPhone('phone', data.phone)
        }
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
        phone,
        setData
    }
}, {
    parentsStores: [
        new ParentStore(
            `${id}ContactInformationCollectionStore`,
            useCollectionStore,
            {
                actionsToRename: {
                    addItem: 'setContactInformationItem',
                    getItem: 'getContactInformationItem',
                    getItems: 'getContactInformations',
                    removeItem: 'removeContactInformation',
                    setItems: 'setContactInformations',
                    updateItem: 'updateContactInformation'
                },
                propertiesToRename: {
                    items: 'contactInformations'
                }
            }
        )
    ]
})()