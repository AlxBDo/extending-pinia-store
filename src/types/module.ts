import type { StoreOptions } from "pinia-plugin-subscription";
import type { ExtendedStoreOptions } from "../types/store";

declare module 'pinia' {
    export interface DefineStoreOptionsBase<S, Store> {
        storeOptions?: ExtendedStoreOptions & StoreOptions
    }
}