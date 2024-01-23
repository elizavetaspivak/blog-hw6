import {Router} from "express";
import {blogValidation} from "../validators/blog-validators";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {postToBlogValidation} from "../validators/post-validators";
import {ObjectId} from "mongodb";
import {
    HTTP_RESPONSE_CODES,
    PaginatorType,
    ParamType,
    RequestTypeWithBody,
    RequestTypeWithBodyAndParams,
    RequestTypeWithParams,
    RequestTypeWithQuery,
    RequestTypeWithQueryAndParams,
    ResponseType
} from "../models/common";
import {OutputPostModel} from "../models/post/output/post.output.models";
import {OutputBlogType} from "../models/blog/output/blog.output.models";
import {BlogCreateType} from "../models/db/db.models";
import {BlogsQueryRepository} from "../repositories/query-repositories/blogs-query-repository";
import {BlogsService} from "../domain/blog-service";
import {CreatePostToBlogInputModel} from "../models/blog/input/create.post.to.blog.input.models";
import {UpdateBlogModel} from "../models/blog/input/update.blog.input.models";
import {QueryBlogInputModels} from "../models/blog/input/query.blog.input.models";
import {QueryPostInputModels} from "../models/post/input/query.post.input.models";

export const blogRoute = Router({})

blogRoute.get('/', async (req: RequestTypeWithQuery<QueryBlogInputModels>, res: ResponseType<PaginatorType<OutputBlogType>>) => {
    const sortData = {
        searchNameTerm: req.query.searchNameTerm,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
    }

    const bloggers = await BlogsQueryRepository.getAllBlogs(sortData)

    res.send(bloggers)
})

blogRoute.get('/:id', async (req: RequestTypeWithParams<ParamType>, res: ResponseType<OutputBlogType>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const blog = await BlogsQueryRepository.getBlogById(id)

    if (!blog) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    res.status(HTTP_RESPONSE_CODES.SUCCESS).send(blog)
})

blogRoute.get('/:id/posts', async (req: RequestTypeWithQueryAndParams<ParamType, QueryPostInputModels>, res: ResponseType<any>) => {
    const blogId = req.params.id

    const blog = await BlogsQueryRepository.getBlogById(blogId)

    if (!blog) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const sortData = {
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
    }

    const posts = await BlogsQueryRepository.getPostsByBlogId(blogId, sortData)

    res.send(posts)
})

blogRoute.post('/', authMiddleware, blogValidation(), async (req: RequestTypeWithBody<{
    name: string,
    description: string,
    websiteUrl: string
}>, res: ResponseType<OutputBlogType>) => {
    const {name, description, websiteUrl} = req.body

    const newBlog: BlogCreateType = {
        name,
        description,
        websiteUrl,
        isMembership: false,
        createdAt: new Date().toISOString()
    }

    const blog = await BlogsService.createBlog(newBlog)

    if (!blog) {
        res.sendStatus(HTTP_RESPONSE_CODES.BAD_REQUEST)
        return
    }

    res.status(HTTP_RESPONSE_CODES.CREATED).send(blog)
})

blogRoute.post('/:id/posts', authMiddleware, postToBlogValidation(), async (req: RequestTypeWithBodyAndParams<ParamType, CreatePostToBlogInputModel>, res: ResponseType<OutputPostModel>) => {
    const title = req.body.title
    const shortDescription = req.body.shortDescription
    const content = req.body.content

    const blogId = req.params.id

    const createPostData: CreatePostToBlogInputModel = {
        title,
        shortDescription,
        content
    }

    const post = await BlogsService.createPostToBlog(blogId, createPostData);

    if (!post) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    res.status(HTTP_RESPONSE_CODES.CREATED).json(post)
})

blogRoute.put('/:id', authMiddleware, blogValidation(), async (req: RequestTypeWithBodyAndParams<ParamType, UpdateBlogModel>, res: ResponseType<{}>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const {name, description, websiteUrl} = req.body

    const isBlogUpdated = await BlogsService.updateBlog(id, {name, description, websiteUrl})

    if (!isBlogUpdated) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    res.sendStatus(HTTP_RESPONSE_CODES.NO_CONTENT)
})

blogRoute.delete('/:id', authMiddleware, async (req: RequestTypeWithParams<ParamType>, res: ResponseType<{}>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const isBlogDeleted = await BlogsService.deleteBlogById(id)

    if (!isBlogDeleted) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return;
    }

    res.sendStatus(HTTP_RESPONSE_CODES.NO_CONTENT)
})