import {Request, Response} from "express";

export type ParamType = {
    id: string
}

export type RequestType = Request<{}, {}, {}, {}>
export type RequestTypeWithParams<T> = Request<T, {}, {}, {}>
export type RequestTypeWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestTypeWithQueryAndParams<P, Q> = Request<P, {}, {}, Q>
export type RequestTypeWithBody<T> = Request<{}, {}, T, {}>
export type RequestTypeWithBodyAndParams<P, B> = Request<P, {}, B, {}>

export type ResponseType<T> = Response<T, {}>
export const HTTP_RESPONSE_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404
}

export type ErrorType = {
    errorsMessages: ErrorMessagesType[]
}

export type ErrorMessagesType = {
    message: string
    field: string
}

export type PaginatorType<I> = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: I[]
}