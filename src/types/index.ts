import type { PluginSubscriber, Store } from "pinia-plugin-subscription/helpers";
import type { StateTree } from "pinia";
import type { Comparison } from "../types/comparison";
import type { ParentStoreInterface, ParentStore as ParentStoreType, ParentStoreResult } from "../types/plugin";
import type { ParentStoreOptions } from "../types/store";


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
export type { ExtendedStoreInstance } from "./store";
export type { CollectionState, CollectionStoreInstance, CollectionStoreMethods, SearchCollectionCriteria } from "../types/collection";
export type { Comparison };
export type { ComparisonNumber, ComparisonString } from "./comparison";
export type {
    ContactInformation,
    ContactInformationState,
    ContactInformationStore,
    ContactInformationStoreInstance,
    ContactInformationStoreState,
    ContactInformationValue
} from "../types/contactInformation";
export type { ErrorsState, ErrorsStore, ErrorsStoreInstance, IError } from "../types/error";
export type { IdentityGetters, IdentityState, IdentityStore, IdentityStoreInstance } from "../types/identity";
export type { ResourceId, ResourceIdStore, ResourceIdStoreInstance } from "../types/resourceId";
export type { WebUserState, WebUserStore, WebUserStoreInstance } from "../types/webuser";


/**
 * Utils
 */
/**
 * Creates a new instance of the ParentStore class, wrapping the provided store instance.
 * @param id The unique identifier for the parent store.
 * @param store The store instance to be wrapped by the parent store.
 * @param storeOptions Optional configuration options for the parent store.
 * @returns A new instance of the ParentStore class.
 * @see ParentStore
 */
export declare function createParentStore<TStore extends object = Record<string, never>, TState extends StateTree = StateTree>(id: string, store: ParentStoreType<TStore, TState>, storeOptions?: ParentStoreOptions): ParentStore<TStore, TState>;
export declare const PLUGIN_NAME: string;
export declare function arrayObjectFindAllBy<T extends object>(arrayOfObject: T[], findBy: Partial<T>, comparison?: Comparison): T[];
export declare function arrayObjectFindBy<T extends object>(arrayOfObject: T[], findBy: Partial<T>): T | undefined;