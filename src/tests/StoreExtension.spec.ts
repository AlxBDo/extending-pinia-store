import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getEnhancedStoreMock } = vi.hoisted(() => ({
  getEnhancedStoreMock: vi.fn()
}))

// Mocks pour éviter d'avoir à charger les packages externes
vi.mock('pinia-plugin-subscription', () => {
  return {
    getEnhancedStore: getEnhancedStoreMock
  }
})

vi.mock('pinia-plugin-subscription/helpers', () => ({
  Store: class Store {
    store: any
    options: any
    state: any
    _className = 'Store'

    constructor(store: any, options: any) {
      this.store = store
      this.options = options || {}
      this.state = store.$state ?? {}
      this.store._customProperties = this.store._customProperties ?? new Set()
    }

    addSubscription() { /* no-op */ }
    hasDeniedFirstChar() { return false }
    storeHas(key: string) { return key in this.store }
    stateHas(key: string) { return key in this.state }
    isOptionApi() { return false }
    getValue(value: any) { return value && value.value !== undefined ? value.value : value }
    debugLog() { /* no-op */ }
  }
}))

vi.mock('pinia-plugin-action-flow', () => ({ ActionsFlows: class ActionsFlows { } }))

import StoreExtension from '../core/StoreExtension'

describe('StoreExtension', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEnhancedStoreMock.mockReset()
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

  it('chains synchronous actions in order and returns the child result', () => {
    const calls: string[] = []

    const parent = {
      $state: { count: 1 },
      say() {
        calls.push('parent')
        return 'parent-result'
      }
    }

    const childStore: any = { $id: 'child', _customProperties: new Set(), $state: {} }
    childStore.say = () => {
      calls.push('child')
      return 'child-result'
    }

    const options: any = {
      parentsStores: [{ build: () => parent }],
      actionsToExtends: ['say']
    }

    new StoreExtension(childStore, options)

    expect(childStore.say()).toBe('child-result')
    expect(calls).toEqual(['parent', 'child'])
  })

  it('waits for an async parent action before calling the child action', async () => {
    const calls: string[] = []
    let resolveParent!: () => void
    const parent = {
      $state: {},
      save: () => new Promise<void>((resolve) => {
        resolveParent = () => {
          calls.push('parent')
          resolve()
        }
      })
    }
    const childStore: any = {
      $id: 'child',
      _customProperties: new Set(),
      $state: {},
      save: () => {
        calls.push('child')
        return 'child-result'
      }
    }

    new StoreExtension(childStore, {
      parentsStores: [{ build: () => parent }],
      actionsToExtends: ['save']
    } as any)

    const result = childStore.save()
    expect(calls).toEqual([])

    resolveParent()

    await expect(result).resolves.toBe('child-result')
    expect(calls).toEqual(['parent', 'child'])
  })

  it('propagates parent action errors without calling the child action', async () => {
    const parentError = new Error('parent failure')
    const parent = {
      $state: {},
      save: () => Promise.reject(parentError)
    }
    const childAction = vi.fn()
    const childStore: any = {
      $id: 'child',
      _customProperties: new Set(),
      $state: {},
      save: childAction
    }

    new StoreExtension(childStore, {
      parentsStores: [{ build: () => parent }],
      actionsToExtends: ['save']
    } as any)

    await expect(childStore.save()).rejects.toBe(parentError)
    expect(childAction).not.toHaveBeenCalled()
  })

  it('calls parent and child Option API actions with their respective stores', () => {
    const parent = {
      $state: {},
      save(this: any) {
        this.parentCalled = true
      }
    }
    const childStore: any = {
      $id: 'child',
      _customProperties: new Set(),
      $state: {},
      save(this: any) {
        this.childCalled = true
      }
    }

    new StoreExtension(childStore, {
      parentsStores: [{ build: () => parent }],
      actionsToExtends: ['save']
    } as any)

    childStore.save()

    expect(parent).toMatchObject({ parentCalled: true })
    expect(childStore).toMatchObject({ childCalled: true })
    expect(parent).not.toHaveProperty('childCalled')
    expect(childStore).not.toHaveProperty('parentCalled')
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

  /**
  it('injects the extended store API into the setup context', () => {
    const setupContext = { extensions: {} }
    const childStore: any = { $id: 'child', _customProperties: new Set(), $state: {} }

    getEnhancedStoreMock.mockReturnValue(setupContext)

    new StoreExtension(childStore, { parentsStores: [{ build: () => ({ $state: {} }) }] } as any)

    expect(setupContext.extensions.enhancedStore).toBe(childStore)
  })
  */
})
