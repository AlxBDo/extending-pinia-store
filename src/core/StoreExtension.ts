import { computed, toRef } from "vue";
import { Store } from "pinia-plugin-subscription";
import { storeStorageSubscriber } from "pinia-plugin-store-storage";
import type { Store as PiniaStore } from "pinia";
import type { AnyObject, CustomConsole, CustomStore, StoreOptions } from "pinia-plugin-subscription";
import type { PluginStoreOptions } from "../types/plugin";
import type ParentStore from "../plugins/parentStore";


const extendedActionsDefault = ['removePersistedState', 'watch', '$reset']

const isProd = import.meta.env.PROD

export default class StoreExtension extends Store {
    protected override _className: string = 'StoreExtension'
    private _extendedActions: Set<string>
    private _parentsStores: CustomStore<AnyObject, AnyObject>[] | undefined
    protected static override _requiredKeys?: string[] | undefined = ['parentsStores']

    get parentsStores(): CustomStore<AnyObject, AnyObject>[] | undefined {
        this.options.childId = this.store.$id

        if (!this._parentsStores) {
            this.buildParentStores()
        }

        return this._parentsStores
    }


    constructor(
        store: PiniaStore,
        options: PluginStoreOptions & AnyObject & StoreOptions,
        debug: boolean = false,
        customConsole?: CustomConsole
    ) {
        super(store, options, debug, customConsole)

        this._extendedActions = this.initExtendedActions()
        this.extendsStore()
    }


    buildParentStores(): void {
        this._parentsStores = (this.options.parentsStores as ParentStore[])?.map(
            store => store.build((this.options.childId) as string) as CustomStore<AnyObject, AnyObject>
        )
    }

    get extendedActions(): Set<string> {
        return this._extendedActions
    }

    get actionsToRename(): Record<string, string> | undefined {
        return this.options.actionsToRename as Record<string, string>
    }

    get propertiesToRename(): Record<string, string> | undefined {
        return this.options.propertiesToRename as Record<string, string>
    }

    private addToCustomProperties(propertyName: string): void {
        if (!isProd) {
            this.store._customProperties.add(propertyName)
        }
    }

    private createComputed(store: AnyObject, key: string) {
        const isObject = typeof store[key] === 'object'

        return computed({
            get: () => {
                return this.getValue(store[key])
            },
            set: (value: any) => {
                if (isObject && store[key]?.value) {
                    store[key].value = value
                } else { store[key] = value }
            }
        })
    }

    /**
     * Duplicates storeToExtend to extendedStore
     * @param {AnyObject} storeToExtend 
     */
    private duplicateStore(storeToExtend: AnyObject): void {
        Object.keys(storeToExtend).forEach((key: string) => {
            if (this.hasDeniedFirstChar(key[0] as string) && key !== '$reset') { return }

            const typeOfProperty = typeof storeToExtend[key]

            if (this.storeHas(key)) {
                if (this.extendedActions.has(key) && typeOfProperty === 'function') {
                    this.extendsAction(storeToExtend, key)
                }
            } else {
                if (typeOfProperty === 'function') {
                    const childStoreActionName = this.getActionNameForChildStore(key)
                    this.store[childStoreActionName] = storeToExtend[key]
                    this.addToCustomProperties(childStoreActionName)
                } else if (typeOfProperty === 'object' && !Array.isArray(storeToExtend[key])) {
                    this.store[key] = this.createComputed(storeToExtend, key)
                    this.addToCustomProperties(key)
                }
            }
        })
    }

    /**
     * Extends storeToExtend's action to extendedStore
     * @param {AnyObject} storeToExtend 
     * @param {string} key 
     */
    private extendsAction(storeToExtend: AnyObject, key: string): void {
        const originalFunction = this.store[key];

        if (this.isOptionApi()) {
            this.store[key] = function (...args: any[]) {
                storeToExtend[key].apply(this, args);
                originalFunction.apply(this, args);
            }
        } else {
            this.store[key] = (...args: any[]) => {
                storeToExtend[key](...args);
                originalFunction(...args);
            }
        }
    }

    private extendsState(storeToExtend: AnyObject) {
        Object.keys(storeToExtend.$state).forEach((key: string) => {
            if (!this.stateHas(key) && !this.hasDeniedFirstChar(key[0] as string)) {
                const childStoreKey = this.getPropertyNameForChildState(key)
                this.store[childStoreKey] = this.state[childStoreKey] = toRef(storeToExtend.$state, key)
                this.addToCustomProperties(childStoreKey)
            }
        })
    }

    /**
     * Extends to store stores list in parentsStores property
     */
    private extendsStore(): void {
        this.debugLog(`extendsStore() - ${this.store.$id}`, [
            'parentsStores:',
            this._parentsStores,
            'options:',
            this.options
        ])

        if (this.parentsStores) {
            const storeToExtend = this.parentsStores

            if (!storeToExtend || !storeToExtend.length) { return }

            this.addSubscription(
                'pinia-plugin-store-storage',
                storeStorageSubscriber,
                { stores: storeToExtend, subscriptionOptions: { storage: true } }
            );

            (storeToExtend as PiniaStore[]).forEach((ste: PiniaStore) => {
                if (ste?.$state) {
                    this.duplicateStore(ste)
                    this.extendsState(ste)
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
        return new Set<string>([...extendedActionsDefault, ...((this.options?.actionsToExtends as string[]) ?? [])])
    }
}