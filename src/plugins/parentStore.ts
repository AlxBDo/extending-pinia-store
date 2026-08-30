import type { StateTree } from "pinia"
import type { ParentStoreInterface, ParentStore as ParentStoreType, ParentStoreResult } from "../types/plugin"
import type { ParentStoreOptions } from "../types/store";

export default class ParentStore<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> implements ParentStoreInterface<TStore, TState> {
    private _storeConstructor: ParentStoreType<TStore, TState>
    private _id: string
    private _storeOptions?: ParentStoreOptions

    get id(): string { return this._id }
    get options(): ParentStoreOptions | undefined { return this._storeOptions }

    constructor(id: string, store: ParentStoreType<TStore, TState>, storeOptions?: ParentStoreOptions) {
        this._storeConstructor = store
        this._id = id
        this._storeOptions = storeOptions
    }

    build(childId?: string): ParentStoreResult<TStore, TState> {
        return this._storeConstructor(`${this._id}${childId ?? ''}`)
    }
}