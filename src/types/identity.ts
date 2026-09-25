import type { Store } from "pinia"

export interface IdentityState {
    birthname?: string
    firstname?: string
    readonly fullname?: string
    gender?: string
    lastname?: string
}

export interface IdentityStore {
    getFullname(): string
    setData(identity: IdentityState): void
}

export interface IdentityGetters {
    readonly fullname: string
}

export type IdentityStoreInstance = Store<string, Omit<IdentityState, 'fullname'>> & IdentityGetters & IdentityStore