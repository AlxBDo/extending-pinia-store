import type { ResourceId, ResourceIdStore } from "./resourceId"
import type { ExtendedStoreInstance } from "./store"

export interface WebUserStore extends ResourceIdStore {
    setData: (data: Partial<WebUserState>) => void
    updatePassword: (newPassword: string, oldPassword: string) => void
}

export interface WebUserState extends ResourceId {
    password?: string
    username?: string
}

export type WebUserStoreInstance = ExtendedStoreInstance<WebUserState, WebUserStore>