import { computed, isRef, toRef } from "vue";
import { Store } from "pinia-plugin-subscription/helpers";
import type { StateTree, Store as PiniaStore } from "pinia";
import type { CustomStore, StoreOptions } from "pinia-plugin-subscription/types";
import type { CustomConsole } from "pinia-plugin-subscription";
import type { ParentStoreInterface, PluginStoreOptions } from "../types/plugin";


const extendedActionsDefault = ['removePersistedState', 'watch', '$reset']

type DynamicStore = PiniaStore & Record<string, unknown>
type DynamicState = StateTree & Record<string, unknown>

const isProd = import.meta.env.PROD

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return (
        (typeof value === 'object' || typeof value === 'function') &&
        value !== null &&
        typeof (value as PromiseLike<unknown>).then === 'function'
    )
}

export default class StoreExtension extends Store {
    protected override _className: string = 'StoreExtension'
    private _extendedActions: Set<string>
    private _parentsStores: CustomStore<Record<string, never>, StateTree>[] | undefined
    protected static override _requiredKeys?: string[] | undefined = ['parentsStores']

    private get extendedStore(): DynamicStore {
        return this.store as DynamicStore
    }

    private get extensionOptions(): PluginStoreOptions {
        return this.options as PluginStoreOptions
    }

    get parentsStores(): CustomStore<Record<string, never>, StateTree>[] | undefined {
        this.extensionOptions.childId = this.extendedStore.$id

        if (!this._parentsStores) {
            this.buildParentStores()
        }

        return this._parentsStores
    }


    constructor(
        store: PiniaStore,
        options: PluginStoreOptions & StoreOptions,
        debug: boolean = false,
        customConsole?: CustomConsole
    ) {
        super(store, options, debug, customConsole)

        this._extendedActions = this.initExtendedActions()
        this.extendsStore()
        this.extendedStore.resetParentStores = () => { this.resetParentStores() }
    }


    buildParentStores(): void {
        this._parentsStores = this.extensionOptions.parentsStores?.map(
            (store: ParentStoreInterface) => store.build(this.extensionOptions.childId ?? '') as CustomStore<Record<string, never>, StateTree>
        )
    }

    get extendedActions(): Set<string> {
        return this._extendedActions
    }

    get actionsToRename(): Record<string, string> | undefined {
        return this.extensionOptions.actionsToRename
    }

    get propertiesToRename(): Record<string, string> | undefined {
        return this.extensionOptions.propertiesToRename
    }

    private addToCustomProperties(propertyName: string): void {
        if (!isProd) {
            this.extendedStore._customProperties = this.extendedStore._customProperties ?? new Set<string>()
                ; (this.extendedStore._customProperties as Set<string>).add(propertyName)
        }
    }

    private createComputed(store: DynamicStore, key: string) {
        const isObject = typeof store[key] === 'object'

        return computed({
            get: () => {
                return this.getValue(store[key]) as unknown
            },
            set: (value: unknown) => {
                if (isObject && isRef(store[key])) {
                    store[key].value = value
                } else {
                    store[key] = value
                }
            }
        })
    }

    /**
     * Duplicates storeToExtend to extendedStore
     * @param storeToExtend
     */
    private duplicateStore(storeToExtend: DynamicStore): void {
        Object.keys(storeToExtend).forEach((key: string) => {
            if (this.hasDeniedFirstChar(key[0] ?? '') && key !== '$reset') { return }

            const typeOfProperty = typeof storeToExtend[key]

            if (this.storeHas(key)) {
                if (this.extendedActions.has(key) && typeOfProperty === 'function') {
                    this.extendsAction(storeToExtend, key)
                }
            } else {
                if (typeOfProperty === 'function') {
                    const childStoreActionName = this.getActionNameForChildStore(key)
                    this.extendedStore[childStoreActionName] = storeToExtend[key]
                    this.addToCustomProperties(childStoreActionName)
                } else if (typeOfProperty === 'object' && !Array.isArray(storeToExtend[key])) {
                    this.extendedStore[key] = this.createComputed(storeToExtend, key)
                    this.addToCustomProperties(key)
                } else {
                    this.extendedStore[key] = toRef(storeToExtend, key)
                }
            }
        })
    }

    /**
     * Extends storeToExtend's action to extendedStore
     * @param storeToExtend
     * @param key
     */
    private extendsAction(storeToExtend: DynamicStore, key: string): void {
        const parentAction = storeToExtend[key]
        const childAction = this.extendedStore[key]

        if (typeof parentAction !== 'function' || typeof childAction !== 'function') {
            throw new TypeError(`Cannot extend "${key}": both parent and child properties must be actions.`)
        }

        this.extendedStore[key] = function (this: DynamicStore, ...args: unknown[]) {
            const parentResult = parentAction.apply(storeToExtend, args)
            const executeChildAction = () => childAction.apply(this, args)

            return isPromiseLike(parentResult)
                ? Promise.resolve(parentResult).then(executeChildAction)
                : executeChildAction()
        }
    }

    private extendsState(storeToExtend: DynamicStore) {
        Object.keys(storeToExtend.$state).forEach((key: string) => {
            if (!this.stateHas(key) && !this.hasDeniedFirstChar(key[0] ?? '')) {
                const childStoreKey = this.getPropertyNameForChildState(key)
                const state = this.state as DynamicState
                this.extendedStore[childStoreKey] = state[childStoreKey] = toRef(storeToExtend.$state as DynamicState, key)
                this.addToCustomProperties(childStoreKey)
            }
        })
    }

    /**
     * Extends to store stores list in parentsStores property
     */
    private extendsStore(): void {
        this.debugLog(`extendsStore() - ${this.extendedStore.$id}`, [
            'parentsStores:',
            this.parentsStores,
            'options:',
            this.extensionOptions
        ])

        if (this.parentsStores) {
            const storeToExtend = this.parentsStores

            if (!storeToExtend || !storeToExtend.length) { return }

            storeToExtend.forEach((ste) => {
                if (ste?.$state) {
                    const parentStore = ste as DynamicStore
                    this.duplicateStore(parentStore)
                    this.extendsState(parentStore)
                }
            })
        }
    }

    private getActionNameForChildStore(parentStoreActionName: string): string {
        return (this.actionsToRename && this.actionsToRename[parentStoreActionName]) ?? parentStoreActionName
    }

    private getPropertyNameForChildState(property: string): string {
        return (this.propertiesToRename && this.propertiesToRename[property]) ?? property
    }

    private initExtendedActions(): Set<string> {
        return new Set<string>([...extendedActionsDefault, ...(this.extensionOptions?.actionsToExtends ?? [])])
    }

    protected static hasRequiredKeys(options: Record<string, unknown>): boolean {
        return Array.isArray(options?.parentsStores) && options.parentsStores.length > 0
    }

    private resetParentStores(): void {
        const parentStores = this.parentsStores
        if (Array.isArray(parentStores) && parentStores.length) {
            parentStores.forEach(store => store?.$reset?.())
        }

        this.debugLog('resetParentsStores', { parentStores })
    }
}