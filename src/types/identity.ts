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