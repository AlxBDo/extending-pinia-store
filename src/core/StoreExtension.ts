import { computed, isRef, toRef } from "vue";
import { Store } from "pinia-plugin-subscription/helpers";
import type { StateTree, Store as PiniaStore } from "pinia";
import type { CustomStore, StoreOptions } from "pinia-plugin-subscription/types";
import type { CustomConsole } from "pinia-plugin-subscription";
import type { ParentStoreInterface, PluginStoreOptions } from "../types/plugin";
import type { ExtendedStoreOptions, ParentStoreOptions } from "../types/store";
import { PluginConsole } from "../utils/pluginConsole";


const extendedActionsDefault = ['removePersistedState', 'watch', '$reset']

type DynamicStore = PiniaStore & Record<string, unknown>
type DynamicState = StateTree & Record<string, unknown>

const isProd = import.meta.env.PROD

export default class StoreExtension extends Store {
    protected override _className: string = 'StoreExtension'
    private _extendedActions: Set<string>
    private _parentsStores: CustomStore<Record<string, never>, StateTree>[] = []
    private _parentsStoresOptionsMap: Map<string, ParentStoreOptions> = new Map<string, ParentStoreOptions>()
    protected static override _requiredKeys?: string[] | undefined = ['parentsStores']


    get actionsToRename(): Record<string, string> | undefined {
        return this.extensionOptions.actionsToRename
    }

    get extendedActions(): Set<string> {
        return this._extendedActions
    }

    private get extensionOptions(): ExtendedStoreOptions {
        return this.options as ExtendedStoreOptions
    }

    private get extendedStore(): DynamicStore {
        return this.store as DynamicStore
    }

    get parentsStores(): CustomStore<Record<string, never>, StateTree>[] | undefined {
        this.extensionOptions.childId = this.extendedStore.$id

        if (!this._parentsStores.length) {
            this.buildParentStores()
        }

        return this._parentsStores
    }

    get propertiesToRename(): Record<string, string> | undefined {
        return this.extensionOptions.propertiesToRename
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


    private addToCustomProperties(propertyName: string): void {
        if (!isProd) {
            this.extendedStore._customProperties = this.extendedStore._customProperties ?? new Set<string>()
                ; (this.extendedStore._customProperties as Set<string>).add(propertyName)
        }
    }

    private buildParentStores(): void {
        if (!this.extensionOptions.parentsStores?.length) {
            return
        }

        this.extensionOptions.parentsStores.forEach((store: ParentStoreInterface) => {
            const parentStore = store.build(this.extensionOptions.childId ?? '') as CustomStore<Record<string, never>, StateTree>
            this._parentsStores.push(parentStore)
            if (store?.options && !this._parentsStoresOptionsMap.has(parentStore.$id)) {
                this._parentsStoresOptionsMap.set(parentStore.$id, store.options)
            }
        })
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
    private duplicateStore(storeToExtend: DynamicStore, parentStoreOptions?: ParentStoreOptions): void {
        Object.keys(storeToExtend).forEach((key: string) => {
            // Skip keys that have a denied first character : ['_', '$']
            if (this.hasDeniedFirstChar(key)) { return }

            const typeOfProperty = typeof storeToExtend[key]
            if (this.storeHas(key)) {
                if (
                    (this.extendedActions.has(key) || parentStoreOptions?.actionsToExtends?.includes(key))
                    && typeOfProperty === 'function'
                ) {
                    this.extendsAction(storeToExtend, key)
                } else {
                    PluginConsole.error(
                        `Action "${key}" of "${storeToExtend.$id ?? 'unknown store'}" is not extended cause its all ready exists in the extended store.`,
                        `
Use the ParentStoreOptions : "actionsToExtends" option, to extend this action, or "actionsToRename" option to rename it.`
                    )
                }
            } else {
                const childStoreActionName = this.getActionNameForChildStore(key, parentStoreOptions)
                if (typeOfProperty === 'function') {
                    this.extendedStore[childStoreActionName] = storeToExtend[key]
                    this.addToCustomProperties(childStoreActionName)
                } else if (typeOfProperty === 'object' && !Array.isArray(storeToExtend[key])) {
                    this.extendedStore[childStoreActionName] = this.createComputed(storeToExtend, key)
                    this.addToCustomProperties(childStoreActionName)
                } else {
                    this.extendedStore[childStoreActionName] = toRef(storeToExtend, key)
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
        const parentAction = storeToExtend[key] as (...args: unknown[]) => unknown
        const childAction = this.extendedStore[key] as (...args: unknown[]) => unknown

        if (this.isOptionApi()) {
            this.extendedStore[key] = function (this: DynamicStore, ...args: unknown[]) {
                parentAction.apply(this, args)
                childAction.apply(this, args)
            }
        } else {
            this.extendedStore[key] = (...args: unknown[]) => {
                parentAction(...args)
                childAction(...args)
            }
        }
    }

    private extendsState(storeToExtend: DynamicStore, parentStoreOptions?: ParentStoreOptions) {
        Object.keys(storeToExtend.$state).forEach((key: string) => {
            if (this.hasDeniedFirstChar(key[0] ?? '')) return

            const childStoreKey = this.getPropertyNameForChildState(key, parentStoreOptions)
            if (this.stateHas(childStoreKey)) {
                PluginConsole.error(
                    `State property "${childStoreKey}" of "${storeToExtend.$id ?? 'unknown store'}" is not extended cause its all ready exists in the extended store.`,
                    `\nUse the ParentStoreOptions: "propertiesToRename" option to rename it.`
                )
                return
            }

            const state = this.state as DynamicState
            this.extendedStore[childStoreKey] = state[childStoreKey] = toRef(storeToExtend.$state as DynamicState, key)
            this.addToCustomProperties(childStoreKey)
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

        const storeToExtend = this.parentsStores

        if (!storeToExtend?.length) { return }

        storeToExtend.forEach((ste) => {
            if (ste?.$state) {
                const parentStore = ste as DynamicStore
                const parentStoreOptions = this._parentsStoresOptionsMap.get(parentStore.$id)
                this.duplicateStore(parentStore, parentStoreOptions)
                this.extendsState(parentStore, parentStoreOptions)
            }
        })
    }

    private getActionNameForChildStore(
        parentStoreActionName: string,
        parentStoreOptions?: ParentStoreOptions
    ): string {
        if (parentStoreOptions?.actionsToRename?.[parentStoreActionName]) {
            return parentStoreOptions.actionsToRename[parentStoreActionName]
        }

        if (this.actionsToRename?.[parentStoreActionName]) {
            return this.actionsToRename[parentStoreActionName]
        }

        return parentStoreActionName
    }

    private getPropertyNameForChildState(
        property: string,
        parentsStoresOptions?: ParentStoreOptions
    ): string {
        if (parentsStoresOptions?.propertiesToRename && parentsStoresOptions.propertiesToRename[property]) {
            return parentsStoresOptions.propertiesToRename[property]
        }

        if (this.propertiesToRename?.[property]) {
            return this.propertiesToRename[property]
        }

        return property
    }

    protected static hasRequiredKeys(options: Record<string, unknown>): boolean {
        return Array.isArray(options?.parentsStores) && options.parentsStores.length > 0
    }

    private initExtendedActions(): Set<string> {
        return new Set<string>([...extendedActionsDefault, ...(this.extensionOptions?.actionsToExtends ?? [])])
    }

    private resetParentStores(): void {
        const parentStores = this.parentsStores
        if (Array.isArray(parentStores) && parentStores.length) {
            parentStores.forEach(store => store?.$reset?.())
        }

        this.debugLog('resetParentsStores', { parentStores })
    }
}