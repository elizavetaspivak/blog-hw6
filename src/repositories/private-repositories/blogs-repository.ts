import {blogsCollections, postsCollections} from "../../db/mongo";
import {ObjectId} from "mongodb";
import {BlogDbType} from "../../models/db/db.models";
import {UpdateBlogModel} from "../../models/blog/input/update.blog.input.models";
import {CreatePostToBlogModel} from "../../models/post/input/create.post.to.blog.input.models";

export class BlogsRepository {
    static async getBlogById(id: string): Promise<BlogDbType | null> {
        const blog = await blogsCollections.findOne({_id: new ObjectId(id)});

        if (!blog){
            return  null
        }

        return blog
    }

    static async createBlog(createdData: BlogDbType): Promise<string | null>  {
        const res = await blogsCollections.insertOne(createdData)

        if (!res || !res.insertedId){
            return null
        }

        return res.insertedId.toString()
    }

    static async createPostToBlog(createdData: CreatePostToBlogModel, blogId: string) {
        const blog = await this.getBlogById(blogId);

        const post = {
            title: createdData.title,
            shortDescription: createdData.shortDescription,
            content: createdData.content,
            blogId,
            createdAt: new Date().toISOString(),
            blogName: blog!.name
        }

        const res = await postsCollections.insertOne(post)

        return res.insertedId.toString()
    }

    static async updateBlog(id: string, updatedData: UpdateBlogModel): Promise<boolean> {
        const res = await blogsCollections.updateOne({_id: new ObjectId(id)}, {
                $set: {
                    name: updatedData.name,
                    description: updatedData.description,
                    websiteUrl: updatedData.websiteUrl
                }
            }, {upsert: true}
        )

        return !!res.matchedCount;
    }

    static async deleteBlogById(id: string): Promise<boolean> {
        const res = await blogsCollections.deleteOne({_id: new ObjectId(id)})

        return !!res.deletedCount
    }
}