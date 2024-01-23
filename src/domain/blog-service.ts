import {blogsCollections} from "../db/mongo";
import {ObjectId} from "mongodb";
import {BlogCreateType, BlogDbType} from "../models/db/db.models";
import {UpdateBlogModel} from "../models/blog/input/update.blog.input.models";
import {BlogsRepository} from "../repositories/private-repositories/blogs-repository";
import {BlogsQueryRepository} from "../repositories/query-repositories/blogs-query-repository";
import {OutputBlogType} from "../models/blog/output/blog.output.models";
import {CreatePostToBlogInputModel} from "../models/blog/input/create.post.to.blog.input.models";
import {PostsQueryRepository} from "../repositories/query-repositories/posts-query-repository";

export class BlogsService {
    static async getBlogById(id: string): Promise<BlogDbType | null> {
        const blog = await blogsCollections.findOne({_id: new ObjectId(id)});

        if (!blog){
            return  null
        }

        return blog
    }

    static async createBlog(createdData: BlogCreateType): Promise<OutputBlogType | null>  {
        const createdBlogId = await BlogsRepository.createBlog(createdData)

        if (!createdBlogId) {
            return null
        }

        const blog = await BlogsQueryRepository.getBlogById(createdBlogId)

        if (!blog) {
            return null
        }

        return blog
    }

    static async createPostToBlog(blogId: string, createdData: CreatePostToBlogInputModel) {
        const blog = await BlogsRepository.getBlogById(blogId)

        if (!blog) {
            return null
        }

        const createdPostId = await BlogsRepository.createPostToBlog(createdData, blogId)

        const post = await PostsQueryRepository.getPostById(createdPostId);

        if (!post) {
            return null
        }

        return post
    }

    static async updateBlog(id: string, updatedData: UpdateBlogModel): Promise<boolean | null> {
        const blog = await BlogsRepository.getBlogById(id)

        if (!blog) {
            return null
        }

        return await BlogsRepository.updateBlog(id, updatedData)
    }

    static async deleteBlogById(id: string): Promise<boolean | null> {
        const blog = await BlogsRepository.getBlogById(id)

        if (!blog) {
            return null;
        }

        return await BlogsRepository.deleteBlogById(id)
    }
}