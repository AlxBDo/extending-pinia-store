import type { SearchCollectionCriteria } from './collection'
import type { Comparison } from './comparison'
import type { ResourceId } from './resourceId'
import type { ExtendedStoreInstance } from './store'

export interface ContactInformation extends ResourceId {
    name: string
    type: string
    value: ContactInformationValue
}

export interface ContactInformationState {
    email: string
    mobilePhone: string
    phone: string
}

export interface ContactInformationStore {
    addContactInformation(name: string, type: string, value: ContactInformationValue): void
    addEmail(name: string, value: string): void
    addMobilePhone(name: string, value: string): void
    addPhone(name: string, value: string): void
    clear(): void
    getContactInformation(criteria: SearchCollectionCriteria): ContactInformation | ContactInformation[] | undefined
    getContactInformationItem(criteria: SearchCollectionCriteria): ContactInformation | undefined
    getContactInformations(criteria?: SearchCollectionCriteria, comparisonMode?: Comparison): ContactInformation[]
    getContactInformationValue(id: string): ContactInformationValue | undefined
    removeContactInformation(criteria: SearchCollectionCriteria): void
    setContactInformationItem(item: ContactInformation): void
    setContactInformations(items: ContactInformation[]): void
    updateContactInformation(item: Partial<ContactInformation>, oldItem?: ContactInformation): void
}

export interface ContactInformationStoreState {
    contactInformations: ContactInformation[]
}

export type ContactInformationStoreInstance = ExtendedStoreInstance<
    ContactInformationStoreState,
    ContactInformationStore,
    Partial<ContactInformationState>
>

export type ContactInformationValue = string | number | Record<string, string> | Array<string | number>