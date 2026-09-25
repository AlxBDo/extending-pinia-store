import { defineAStoreCtx, getEnhancedStore, isEmpty } from "pinia-plugin-subscription";
import { useCollectionStore } from "./collection";
import ParentStore from "../plugins/parentStore";

import type { ComparisonNumber } from "../types/comparison";
import type { ErrorsState, IError, ErrorsStore } from "../types/error";

interface ErrorStoreCtx<TError extends IError = IError> {
    setError(error: TError): void
}


export const useErrorsStore = <TError extends IError = IError>(id: string) =>
    defineAStoreCtx<ErrorsStore<TError> & ErrorStoreCtx<TError>, ErrorsState<TError>>(
        id,
        (ctx) => {
            function addError(error: TError): void {
                if (!error?.id) {
                    throw new Error(`${id}Store - addError - Error: id is required`)
                }

                if (!error?.level) {
                    error.level = 1
                }

                !getErrorById(error.id) && getStore()?.setError(error)
            }

            function getErrorById(errorId: string): TError | undefined {
                if (!isEmpty(errorId)) {
                    return getStore()?.getError({ id: errorId }) as TError | undefined
                }
            }

            function getErrorsByLevel(value: number, comparison: ComparisonNumber = '>='): TError[] | undefined {
                return getStore()?.getErrors({ level: value } as Partial<TError>, comparison) as TError[] | undefined;
            }

            function getStore() {
                return getEnhancedStore<ErrorsStore<TError> & ErrorStoreCtx<TError> & ErrorsState<TError>>(ctx)
            }

            function hasError(level: number = 0): boolean {
                return !isEmpty(getErrorsByLevel(level))
            }


            return {
                addError,
                getErrorById,
                getErrorsByLevel,
                hasError
            }
        },
        {
            parentsStores: [
                new ParentStore(`${id}ErrorCollectionStore`, useCollectionStore, {
                    actionsToRename: {
                        addItem: 'setError',
                        clear: 'clearErrors',
                        getItem: 'getError',
                        getItems: 'getErrors',
                        removeItem: 'removeError',
                        setItems: 'setErrors',
                        updateItem: 'updateError'
                    },
                    propertiesToRename: { items: 'errors' }
                })
            ]
        }
    )()