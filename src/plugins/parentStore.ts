import type { StateTree } from "pinia"
import type { ParentStoreInterface, ParentStore as ParentStoreType, ParentStoreResult } from "../types/plugin"

export default class ParentStore<
    TStore extends object = Record<string, never>,
    TState extends StateTree = StateTree
> implements ParentStoreInterface<TStore, TState> {
    private _storeConstructor: ParentStoreType<TStore, TState>
    private _id: string

    get id(): string { return this._id }

    constructor(id: string, store: ParentStoreType<TStore, TState>) {
        this._storeConstructor = store
        this._id = id
    }

    build(childId?: string): ParentStoreResult<TStore, TState> {
        return this._storeConstructor(`${this._id}${childId ?? ''}`)
    }
}