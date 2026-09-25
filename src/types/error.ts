import type { Comparison } from "./comparison";
import type { ExtendedStoreInstance } from "./store";

export interface IError {
    id: string
    level?: number
    message: string
}

export interface ErrorsState<TError extends IError = IError> {
    errors: TError[]
}
export interface ErrorsStore<TError extends IError = IError> {
    addError: (error: TError) => void
    clearErrors: () => void
    getError: (errorId: { id: string }) => TError | undefined
    getErrors: (findBy?: Partial<TError>, comparisonMode?: Comparison) => TError[] | undefined
    getErrorById: (id: string) => TError | undefined
    getErrorsByLevel: (value: number, comparisonMode?: Comparison) => TError[] | undefined
    hasError: (level?: number) => boolean
    removeError: (criteria: Partial<TError>) => void
    setError: (error: TError) => void
    setErrors: (errors: TError[]) => void
    updateError: (updatedError: TError, oldError?: TError) => void
}

export type ErrorsStoreInstance<TError extends IError = IError> =
    ExtendedStoreInstance<ErrorsState<TError>, ErrorsStore<TError>>
