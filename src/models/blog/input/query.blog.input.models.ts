import {SortDirection} from "mongodb";

export type QueryBlogInputModels = {
    searchNameTerm?: string
    sortBy?: string
    sortDirection?: SortDirection
    pageNumber?: number
    pageSize?: number
}