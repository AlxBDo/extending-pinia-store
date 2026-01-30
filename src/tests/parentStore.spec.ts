import { describe, it, expect } from 'vitest'
import ParentStore from '../plugins/parentStore'
import type { CustomStore } from 'pinia-plugin-subscription'

describe('ParentStore', () => {
    const captured: string[] = []
    const storeFactory = (id: string): CustomStore<any, any> => { captured.push(id); return ({ $id: id, $state: {} } as unknown as CustomStore<any, any>) }

    it('exposes the id via getter', () => {
        const p = new ParentStore('parent', storeFactory)
        expect(p.id).toBe('parent')
    })

    it('builds a child store with concatenated id when childId provided', () => {

        const p = new ParentStore('parent-', storeFactory)

        const result = p.build('child')

        expect(captured.length).toBe(1)
        expect(captured[0]).toBe('parent-child')
        expect(result.$id).toBe('parent-child')
    })

    it('builds with only parent id when childId is falsy', () => {
        const captured: string[] = []
        const storeFactory = (id: string): CustomStore<any, any> => { captured.push(id); return ({ $id: id, $state: {} } as unknown as CustomStore<any, any>) }

        const p = new ParentStore('parent', storeFactory)

        // undefined
        const res1 = p.build(undefined as unknown as string)
        expect(captured[0]).toBe('parent')
        expect(res1.$id).toBe('parent')

        // empty string
        const res2 = p.build('')
        expect(captured[1]).toBe('parent')
        expect(res2.$id).toBe('parent')
    })
})
