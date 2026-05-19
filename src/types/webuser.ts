import { ResourceId, ResourceIdStore } from "./resourceId"

export interface WebUserStore extends ResourceIdStore {
    setData: (data: Partial<WebUserState>) => void
    updatePassword: (newPassword: string, oldPassword: string) => void
}

export interface WebUserState extends ResourceId {
    password?: string
    username?: string
}