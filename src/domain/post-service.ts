import {PostsRepository} from "../repositories/private-repositories/posts-repository";
import {PostsQueryRepository} from "../repositories/query-repositories/posts-query-repository";
import {OutputPostModel} from "../models/post/output/post.output.models";
import {PostCreateType, PostUpdateType} from "../models/db/db.models";
import {BlogsRepository} from "../repositories/private-repositories/blogs-repository";
import {CreatePostModel} from "../models/post/input/create.post.input.models";
import {UpdatePostModel} from "../models/post/input/update.post.input.models";

export class PostService {

    static async createPost(createdPostData: CreatePostModel): Promise<OutputPostModel | null> {
        const blog = await BlogsRepository.getBlogById(createdPostData.blogId)

        const newPost: PostCreateType = {
            title: createdPostData.title,
            shortDescription: createdPostData.shortDescription,
            content: createdPostData.content,
            blogId: createdPostData.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        }

        const createdPostId = await PostsRepository.createPost(newPost)

        if (!createdPostId) {
            return null
        }

        const post = await PostsQueryRepository.getPostById(createdPostId)

        if (!post) {
            return null
        }

        return post
    }

    static async updatePost(postId: string, updatePostData: UpdatePostModel): Promise<boolean | null> {
        const post = await PostsRepository.getPostById(postId)
        const blog = await BlogsRepository.getBlogById(updatePostData.blogId)

        if (!post) {
            return null;
        }

        const updatedPost: PostUpdateType = {
            title: updatePostData.title,
            shortDescription: updatePostData.shortDescription,
            content: updatePostData.content,
            blogId: updatePostData.blogId,
            blogName: blog!.name
        }

        return await PostsRepository.updatePost(postId, updatedPost)
    }

    static async deletePost(postId: string): Promise<boolean | null> {
        const post = await PostsRepository.getPostById(postId)

        if (!post) {
            return null;
        }

        return await PostsRepository.deletePostById(postId)
    }
}