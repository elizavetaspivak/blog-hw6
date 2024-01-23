import {Router} from "express";
import {PostsRepository} from "../repositories/private-repositories/posts-repository";
import {BlogsRepository} from "../repositories/private-repositories/blogs-repository";
import {postValidation} from "../validators/post-validators";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {ObjectId, SortDirection} from "mongodb";
import {
    HTTP_RESPONSE_CODES,
    PaginatorType,
    ParamType,
    RequestTypeWithBody,
    RequestTypeWithBodyAndParams,
    RequestTypeWithParams,
    RequestTypeWithQuery,
    ResponseType
} from "../models/common";
import {OutputPostModel} from "../models/post/output/post.output.models";
import {CreatePostModel} from "../models/post/input/create.post.input.models";
import {UpdatePostModel} from "../models/post/input/update.post.input.models";
import {PostCreateType, PostUpdateType} from "../models/db/db.models";
import {PostsQueryRepository} from "../repositories/query-repositories/posts-query-repository";
import {QueryPostInputModels} from "../models/post/input/query.post.input.models";
import {PostService} from "../domain/post-service";

export const postRoute = Router({})

postRoute.get('/', async (req: RequestTypeWithQuery<QueryPostInputModels>, res: ResponseType<PaginatorType<OutputPostModel>>) => {
    const sortData = {
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
    }

    const posts = await PostsQueryRepository.getAllPosts(sortData)

    res.send(posts)
})

postRoute.get('/:id', async (req: RequestTypeWithParams<ParamType>, res: ResponseType<OutputPostModel>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const foundedPost = await PostsQueryRepository.getPostById(id)

    if (!foundedPost) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    res.send(foundedPost)
})

postRoute.post('/', authMiddleware, postValidation(), async (req: RequestTypeWithBody<CreatePostModel>, res: ResponseType<OutputPostModel>) => {
    const {title, shortDescription, content, blogId} = req.body

    const createdPost = await PostService.createPost({title, blogId, content, shortDescription})

    if (!createdPost) {
        res.sendStatus(HTTP_RESPONSE_CODES.BAD_REQUEST)
        return
    }

    res.status(HTTP_RESPONSE_CODES.CREATED).send(createdPost)
})

postRoute.put('/:id', authMiddleware, postValidation(), async (req: RequestTypeWithBodyAndParams<ParamType, UpdatePostModel>, res: ResponseType<void>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const {title, shortDescription, content, blogId} = req.body

    const isPostUpdated = await PostService.updatePost(id, {title, shortDescription, content, blogId})

    if (!isPostUpdated) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    res.sendStatus(HTTP_RESPONSE_CODES.NO_CONTENT)
})

postRoute.delete('/:id', authMiddleware, async (req: RequestTypeWithParams<ParamType>, res: ResponseType<void>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const isPostDeleted = await PostService.deletePost(id)

    if (!isPostDeleted) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return;
    }

    res.sendStatus(HTTP_RESPONSE_CODES.NO_CONTENT)
})