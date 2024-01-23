import {blogsCollections, postsCollections} from "../../db/mongo";
import {ObjectId} from "mongodb";
import {blogMapper} from "../../models/blog/mappers/blog-mapper";
import {OutputBlogType} from "../../models/blog/output/blog.output.models";
import {PaginatorType} from "../../models/common";
import {OutputPostModel} from "../../models/post/output/post.output.models";
import {QueryBlogInputModels} from "../../models/blog/input/query.blog.input.models";
import {QueryPostInputModels} from "../../models/post/input/query.post.input.models";

export class BlogsQueryRepository {
    static async getAllBlogs(sortData: QueryBlogInputModels): Promise<PaginatorType<OutputBlogType>> {
        const searchNameTerm = sortData.searchNameTerm ?? null
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = sortData.pageSize ?? 10

        const blogs = await blogsCollections
            .find(searchNameTerm ? {
                name: {
                    $regex: searchNameTerm,
                    $options: "i"
                }
            } : {})
            .sort(sortBy, sortDirection)
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray();

        const totalCount = await blogsCollections.countDocuments(
            searchNameTerm ? {
                name: {
                    $regex: searchNameTerm,
                    $options: "i"
                }
            } : {})

        const pagesCount = Math.ceil(totalCount / +pageSize);

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: blogs.map(blogMapper)
        }
    }

    static async getBlogById(id: string): Promise<OutputBlogType | null> {
        const blog = await blogsCollections.findOne({_id: new ObjectId(id)});

        if (!blog){
            return  null
        }

        return blogMapper(blog)
    }

    static async getPostsByBlogId(id: string, sortData: QueryPostInputModels): Promise<PaginatorType<OutputPostModel>>  {
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = sortData.pageSize ?? 10

        const posts = await postsCollections
            .find({blogId: id})
            .sort(sortBy, sortDirection)
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray();

        const totalCount = await postsCollections.countDocuments(
            {blogId: id})

        const pagesCount = Math.ceil(totalCount / +pageSize);

        return {
            pagesCount: +pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: posts.map((p: any) => ({
                id: p._id.toString(),
                title: p.title,
                shortDescription: p.shortDescription,
                content: p.content,
                blogName: p.blogName,
                createdAt: p.createdAt,
                blogId: p.blogId,
            }))
        }
    }
}