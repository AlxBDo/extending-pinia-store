import { beforeEach, describe, expect, it, vi } from 'vitest'

const { defineAStoreMock, getStoreMock } = vi.hoisted(() => ({
    defineAStoreMock: vi.fn(),
    getStoreMock: vi.fn()
}))

vi.mock('pinia-plugin-subscription', () => ({
    defineAStore: defineAStoreMock,
    isEmpty: (value: unknown) => value === undefined || value === null || value === ''
}))

vi.mock('pinia-plugin-store-storage', () => ({
    getStore: getStoreMock
}))

import { useErrorsStore } from '../stores/errors'

describe('useErrorsStore', () => {
    beforeEach(() => {
        defineAStoreMock.mockReset()
        getStoreMock.mockReset()
        defineAStoreMock.mockImplementation((id: string, setup: (ctx?: { id: string, extensions: Record<string, unknown> }) => object) => () => {
            const ctx = { id, extensions: {} as Record<string, unknown> }

            return {
                $id: id,
                _ctx: ctx,
                ...setup(ctx)
            }
        })
    })

    it('uses ctx.extensions.extending for internal collection calls when available', () => {
        const addItem = vi.fn()
        const getError = vi.fn(() => undefined)
        const getErrors = vi.fn(() => [])
        const store = useErrorsStore('errorsStore') as ReturnType<typeof useErrorsStore> & {
            _ctx: { extensions: Record<string, unknown> }
        }

        store._ctx.extensions.extending = { addItem, getError, getErrors }
        store.addError({ id: 'error-1', message: 'boom' })

        expect(getStoreMock).not.toHaveBeenCalled()
        expect(getError).toHaveBeenCalledWith({ id: 'error-1' })
        expect(addItem).toHaveBeenCalledWith({ id: 'error-1', message: 'boom', level: 1 })
    })

    it('falls back to pinia-plugin-store-storage when extending context is unavailable', () => {
        const fallbackStore = {
            addItem: vi.fn(),
            getError: vi.fn(() => undefined),
            getErrors: vi.fn(() => [])
        }

        getStoreMock.mockReturnValue(fallbackStore)

        const store = useErrorsStore('fallbackStore')
        store.addError({ id: 'error-2', message: 'fallback' })

        expect(getStoreMock).toHaveBeenCalledWith('fallbackStore')
        expect(fallbackStore.getError).toHaveBeenCalledWith({ id: 'error-2' })
        expect(fallbackStore.addItem).toHaveBeenCalledWith({ id: 'error-2', message: 'fallback', level: 1 })
    })
})
