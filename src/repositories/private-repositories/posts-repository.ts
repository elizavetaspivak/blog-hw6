import {postsCollections} from "../../db/mongo";
import {ObjectId} from "mongodb";
import {UpdatePostModel} from "../../models/post/input/update.post.input.models";
import {PostDbType} from "../../models/db/db.models";

export class PostsRepository {

    static async getPostById(id: string): Promise<PostDbType | null> {
        const post = await postsCollections.findOne({_id: new ObjectId(id)});

        if (!post) {
            return null
        }

        return post
    }
    static async createPost(postData: PostDbType): Promise<string | null> {
        const res = await postsCollections.insertOne(postData)

        if (!res || !res.insertedId){
            return null
        }

        return res.insertedId.toString()
    }

    static async updatePost(id: string, postData: UpdatePostModel): Promise<boolean> {
        const res = await postsCollections.updateOne({_id: new ObjectId(id)}, {
                $set: {
                    title: postData.title,
                    shortDescription: postData.shortDescription,
                    content: postData.content,
                    blogId: postData.blogId
                }
            }, {upsert: true}
        )

        return !!res.matchedCount;
    }

    static async deletePostById(id: string): Promise<boolean> {
        const res = await postsCollections.deleteOne({_id: new ObjectId(id)})

        return !!res.deletedCount
    }
}