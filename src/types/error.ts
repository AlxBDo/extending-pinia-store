export interface IError {
    id: string
    level?: number
    message: string
}

export interface ErrorsState<TError extends IError = IError> {
    errors: TError[]
}