import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks pour éviter d'avoir à charger les packages externes
vi.mock('pinia-plugin-subscription', () => {
  return {
    Store: class Store {
      store: any
      options: any
      state: any
      _className = 'Store'

      constructor(store: any, options: any) {
        this.store = store
        this.options = options || {}
        this.state = store.$state ?? {}
        // ensure _customProperties exists
        this.store._customProperties = this.store._customProperties ?? new Set()
      }

      addSubscription() {
        // no-op
      }

      hasDeniedFirstChar() { return false }
      storeHas(key: string) { return key in this.store }
      stateHas(key: string) { return key in this.state }
      isOptionApi() { return false }
      getValue(value: any) { return value && value.value !== undefined ? value.value : value }
      debugLog() { /* no-op */ }
    }
  }
})

vi.mock('pinia-plugin-store-storage', () => ({ storeStorageSubscriber: () => { } }))
vi.mock('pinia-plugin-action-flow', () => ({ ActionsFlows: class ActionsFlows { } }))

import StoreExtension from '../core/StoreExtension'

describe('StoreExtension', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initExtendedActions merges defaults and provided actions', () => {
    const store = { $id: 'child', _customProperties: new Set(), $state: {} }
    const options = { actionsToExtends: ['myCustom'] }

    const ext = new StoreExtension(store as any, options as any)

    expect(ext.extendedActions.has('myCustom')).toBeTruthy()
    // defaults
    expect(ext.extendedActions.has('removePersistedState')).toBeTruthy()
    expect(ext.extendedActions.has('watch')).toBeTruthy()
    expect(ext.extendedActions.has('$reset')).toBeTruthy()
  })

  it('duplicates functions and extends existing actions calling parent then original (arrow version)', () => {
    const calls: string[] = []

    const parent = {
      $state: { count: 1 },
      say() { calls.push('parent') }
    }

    const childStore: any = { $id: 'child', _customProperties: new Set(), $state: {} }
    // child already has a say method -> should be extended
    childStore.say = () => calls.push('child')

    const options: any = {
      parentsStores: [{ build: () => parent }],
      actionsToExtends: ['say']
    }

    const ext = new StoreExtension(childStore, options)

    // calling the resulting method should call parent then original (arrow path used because isOptionApi false)
    childStore.say()
    expect(calls).toEqual(['parent', 'child'])
  })

  it('adds new actions with optional renaming and marks custom properties', () => {
    const parent = {
      $state: {},
      newAction: () => 'ok'
    }

    const childStore: any = { $id: 'child', _customProperties: new Set(), $state: {} }

    const options: any = {
      parentsStores: [{ build: () => parent }],
      actionsToRename: { newAction: 'renamedNew' }
    }

    const ext = new StoreExtension(childStore, options)

    expect(typeof childStore.renamedNew).toBe('function')
    expect(childStore._customProperties.has('renamedNew')).toBeTruthy()
    expect(childStore.renamedNew()).toBe('ok')
  })

  it('creates computed properties from parent objects and refs state (with renaming) and registers them as custom properties', () => {
    const parent = {
      $state: { count: 42 },
      parentObj: { hello: 'world' }
    }

    const childStore: any = { $id: 'child', _customProperties: new Set(), $state: {} }

    const options: any = {
      parentsStores: [{ build: () => parent }],
      propertiesToRename: { count: 'renamedCount' }
    }

    const ext = new StoreExtension(childStore, options)

    // parent object duplicated as computed
    expect(childStore.parentObj).toBeDefined()
    // computed ref has .value equal to original object
    expect((childStore.parentObj as any).value).toBe(parent.parentObj)

    // state ref renamed and attached both to store and state
    expect(childStore.renamedCount).toBeDefined()
    expect((childStore.renamedCount as any).value).toBe(42)
    expect(ext.state.renamedCount).toBe(childStore.renamedCount)

    // custom properties registered
    expect(childStore._customProperties.has('parentObj')).toBeTruthy()
    expect(childStore._customProperties.has('renamedCount')).toBeTruthy()
  })
})
