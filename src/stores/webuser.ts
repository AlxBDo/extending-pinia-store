import { ref } from "vue"
import { defineAStore } from "pinia-plugin-subscription"
import { useResourceIdStore } from "./resourceId"
import ParentStore from "../plugins/parentStore"
import type { WebUserState, WebUserStore } from "../types/webuser"


export const useWebUserStore = (id?: string) => defineAStore<WebUserStore, WebUserState>(
    id ?? 'webuserStore',
    () => {
        const password = ref<string>()
        const username = ref<string>()

        function updatePassword(newPassword: string, oldPassword: string): void {
            if (oldPassword.trim() === password.value) {
                password.value = newPassword
            }
        }

        function setData(data: WebUserState) {
            if (data.password) { password.value = data.password; }
            if (data.username) { username.value = data.username }
        }

        return {
            password,
            setData,
            updatePassword,
            username
        }
    },
    {
        actionsToExtends: ['setData'],
        parentsStores: [new ParentStore('resourceId', useResourceIdStore)]
    }
)()