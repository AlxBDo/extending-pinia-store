import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getEnhancedStoreMock } = vi.hoisted(() => ({
  getEnhancedStoreMock: vi.fn()
}))

// Mocks pour éviter d'avoir à charger les packages externes
vi.mock('pinia-plugin-subscription', () => {
  return {
    CustomConsole: class CustomConsole {
      error() { /* no-op */ }
      log() { /* no-op */ }
      warn() { /* no-op */ }
    },
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

  it('uses parentStore options with higher priority over global options for renaming actions and properties', () => {
    const parent = {
      $id: 'parentStore',
      $state: { title: 'hello', count: 1 },
      fetchData: () => 'data'
    }

    const childStore: any = { $id: 'child', _customProperties: new Set(), $state: {} }

    const options: any = {
      parentsStores: [{
        build: () => parent,
        options: {
          actionsToRename: { fetchData: 'parentFetch' },
          propertiesToRename: { title: 'parentTitle' }
        }
      }],
      actionsToRename: { fetchData: 'globalFetch' },
      propertiesToRename: { title: 'globalTitle' }
    }

    const ext = new StoreExtension(childStore, options)

    // ParentStore-level renaming takes precedence
    expect(typeof childStore.parentFetch).toBe('function')
    expect(childStore.globalFetch).toBeUndefined()
    expect((childStore.parentTitle as any).value).toBe('hello')
    expect(ext.state.parentTitle).toBeDefined()
    expect(ext.state.globalTitle).toBeUndefined()
  })

  it('supports actionsToExtends defined inside ParentStoreOptions', () => {
    const calls: string[] = []
    const parent = {
      $id: 'parentStore',
      $state: {},
      save: () => { calls.push('parent') }
    }

    const childStore: any = {
      $id: 'child',
      _customProperties: new Set(),
      $state: {},
      save: () => { calls.push('child'); return 'done' }
    }

    const options: any = {
      parentsStores: [{
        build: () => parent,
        options: {
          actionsToExtends: ['save']
        }
      }]
    }

    new StoreExtension(childStore, options)

    expect(childStore.save()).toBe('done')
    expect(calls).toEqual(['parent', 'child'])
  })

  it('logs an error when an action already exists in child and is not marked for extension', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const parent = {
      $id: 'parentA',
      $state: {},
      existingAction: () => 'parent'
    }

    const childStore: any = {
      $id: 'child',
      _customProperties: new Set(),
      $state: {},
      existingAction: () => 'child'
    }

    new StoreExtension(childStore, {
      parentsStores: [{ build: () => parent }]
    } as any)

    // child action is untouched
    expect(childStore.existingAction()).toBe('child')
    errorSpy.mockRestore()
  })

  it('logs an error when a state property destination already exists in child store', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const parent = {
      $id: 'parentA',
      $state: { sharedProp: 'parentVal' }
    }

    const childStore: any = {
      $id: 'child',
      _customProperties: new Set(),
      $state: { sharedProp: 'childVal' }
    }

    const ext = new StoreExtension(childStore, {
      parentsStores: [{ build: () => parent }]
    } as any)

    expect(ext.state.sharedProp).toBe('childVal')
    errorSpy.mockRestore()
  })

  it('allows extending multiple parent stores with separate ParentStoreOptions without collision', () => {
    const parent1 = {
      $id: 'collection1',
      $state: { items: ['list1', 'list2'] },
      addItem: (item: string) => `add-list-${item}`
    }
    const parent2 = {
      $id: 'collection2',
      $state: { items: ['user1', 'user2'] },
      addItem: (item: string) => `add-user-${item}`
    }

    const childStore: any = {
      $id: 'multiChild',
      _customProperties: new Set(),
      $state: {}
    }

    const options: any = {
      parentsStores: [
        {
          build: () => parent1,
          options: {
            actionsToRename: { addItem: 'addList' },
            propertiesToRename: { items: 'lists' }
          }
        },
        {
          build: () => parent2,
          options: {
            actionsToRename: { addItem: 'addUser' },
            propertiesToRename: { items: 'users' }
          }
        }
      ]
    }

    const ext = new StoreExtension(childStore, options)

    expect(typeof childStore.addList).toBe('function')
    expect(typeof childStore.addUser).toBe('function')
    expect(childStore.addList('test')).toBe('add-list-test')
    expect(childStore.addUser('test')).toBe('add-user-test')
    expect((childStore.lists as any).value).toEqual(['list1', 'list2'])
    expect((childStore.users as any).value).toEqual(['user1', 'user2'])
    expect(ext.state.lists).toBeDefined()
    expect(ext.state.users).toBeDefined()
  })

  it('resets all parent stores when resetParentStores is invoked', () => {
    const reset1 = vi.fn()
    const reset2 = vi.fn()
    const parent1 = { $id: 'p1', $state: {}, $reset: reset1 }
    const parent2 = { $id: 'p2', $state: {}, $reset: reset2 }

    const childStore: any = {
      $id: 'child',
      _customProperties: new Set(),
      $state: {}
    }

    new StoreExtension(childStore, {
      parentsStores: [
        { build: () => parent1 },
        { build: () => parent2 }
      ]
    } as any)

    expect(typeof childStore.resetParentStores).toBe('function')
    childStore.resetParentStores()
    expect(reset1).toHaveBeenCalledTimes(1)
    expect(reset2).toHaveBeenCalledTimes(1)
  })
})
