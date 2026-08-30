import type { CustomConsole, PluginSubscriber, Store } from "pinia-plugin-subscription";
import type { StateTree } from "pinia";
import type { CollectionState, CollectionStoreMethods } from "../types/collection";
import type { Comparison } from "../types/comparison";
import type { IError } from "../types/error";
import type { ParentStoreInterface, ParentStore as ParentStoreType, ParentStoreResult } from "../types/plugin";
import type { ResourceId } from "../types/resourceId";

export type {
    ExtendedStore,
    ExtendedStoreOptions,
    ParentStoreOptions
} from "./store";

export declare class ParentStore<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> implements ParentStoreInterface<TStore, TState> {
    private _storeConstructor;
    private _id;
    private _storeOptions?;
    get id(): string;
    get options(): import("./store").ParentStoreOptions | undefined;
    constructor(id: string, store: ParentStoreType<TStore, TState>, storeOptions?: import("./store").ParentStoreOptions);
    build(childId?: string): ParentStoreResult<TStore, TState>;
}
declare class StoreExtension extends Store { }
declare class ExtendsPiniaStoreClass extends PluginSubscriber<StoreExtension> { }
export declare const ExtendsPiniaStore: ExtendsPiniaStoreClass;

/**
 * Stores
 */
export declare const useCollectionStore: (id?: string) => import("pinia").Store<string, CollectionState<Record<string, unknown>>, {}, {
    addItem(item: Record<string, unknown>): void;
    clear(): void;
    getItem(criteria: Partial<Record<string, unknown>>): Record<string, unknown> | undefined;
    getItems(criteria?: Partial<Record<string, unknown>>, comparisonMode?: Comparison): Record<string, unknown>[];
    removeItem(item: Record<string, unknown>): void;
    setItems(items: Record<string, unknown>[]): void;
    updateItem(updatedItem: Record<string, unknown>, oldItem?: Record<string, unknown>): void;
}>;
export declare const useContactInformationStore: (id: string) => import("pinia").Store<string, import("pinia").StateTree, import("pinia")._GettersTree<import("pinia").StateTree>, import("pinia")._ActionsTree>;
type omitActions = 'clear' | 'getItem' | 'getItems' | 'removeItem' | 'setItems';
export interface ErrorsStore<TError extends IError = IError> extends Omit<CollectionStoreMethods, omitActions> {
    addError: (error: TError) => void;
    clearErrors: () => void;
    getError: (errorId: {
        id: string;
    }) => TError | undefined;
    getErrors: (findBy?: Partial<TError>, comparisonMode?: Comparison) => TError[] | undefined;
    getErrorById: (id: string) => TError | undefined;
    getErrorsByLevel: (value: number, comparisonMode?: Comparison) => TError[] | undefined;
    hasError: (level?: number) => boolean;
    removeError: (criteria: Partial<TError>) => void;
    setErrors: (errors: TError[]) => void;
}
export declare const useErrorsStore: <TError extends IError = IError>(id: string) => import("pinia").Store<string, import("pinia").StateTree, import("pinia")._GettersTree<import("pinia").StateTree>, import("pinia")._ActionsTree>;
export declare const useIdentityStore: (id: string) => import("pinia").Store<string, Pick<{
    birthname: import("vue").Ref<string | undefined, string | undefined>;
    firstname: import("vue").Ref<string | undefined, string | undefined>;
    fullname: import("vue").ComputedRef<string>;
    gender: import("vue").Ref<string | undefined, string | undefined>;
    getFullname: () => string;
    lastname: import("vue").Ref<string | undefined, string | undefined>;
    setData: (identity: IdentityState) => void;
}, "birthname" | "firstname" | "gender" | "lastname">, Pick<{
    birthname: import("vue").Ref<string | undefined, string | undefined>;
    firstname: import("vue").Ref<string | undefined, string | undefined>;
    fullname: import("vue").ComputedRef<string>;
    gender: import("vue").Ref<string | undefined, string | undefined>;
    getFullname: () => string;
    lastname: import("vue").Ref<string | undefined, string | undefined>;
    setData: (identity: IdentityState) => void;
}, "fullname">, Pick<{
    birthname: import("vue").Ref<string | undefined, string | undefined>;
    firstname: import("vue").Ref<string | undefined, string | undefined>;
    fullname: import("vue").ComputedRef<string>;
    gender: import("vue").Ref<string | undefined, string | undefined>;
    getFullname: () => string;
    lastname: import("vue").Ref<string | undefined, string | undefined>;
    setData: (identity: IdentityState) => void;
}, "getFullname" | "setData">>;
export declare const useResourceIdStore: (id: string) => import("pinia").Store<string, ResourceId, {}, {
    setData(data: Partial<ResourceId>): void;
}>;
export declare const useWebUserStore: (id?: string) => import("pinia").Store<string, import("pinia").StateTree, import("pinia")._GettersTree<import("pinia").StateTree>, import("pinia")._ActionsTree>;


/**
 * Utils
 */
export declare const PLUGIN_NAME: string;
export declare function arrayObjectFindAllBy<T extends object>(arrayOfObject: T[], findBy: Partial<T>, comparison?: Comparison): T[];
export declare function arrayObjectFindBy<T extends object>(arrayOfObject: T[], findBy: Partial<T>): T | undefined;
declare class PluginConsoleClass extends CustomConsole {
    protected _pluginName: string;
}
export declare const PluginConsole: PluginConsoleClass;