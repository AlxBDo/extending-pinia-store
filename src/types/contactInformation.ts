import type { SearchCollectionCriteria } from './collection'
import type { ResourceId } from './resourceId'

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
    getContactInformation(criteria: SearchCollectionCriteria): ContactInformation | ContactInformation[] | undefined
    getContactInformationValue(id: string): ContactInformationValue
}

export type ContactInformationValue = string | number | Record<string, string> | Array<string | number>