import {blogsCollections, postsCollections, usersCollections} from "../../db/mongo";
import {ObjectId} from "mongodb";
import {BlogDbType, UsersDbType} from "../../models/db/db.models";
import {UpdateBlogModel} from "../../models/blog/input/update.blog.input.models";
import {CreatePostToBlogModel} from "../../models/post/input/create.post.to.blog.input.models";
import {UserService} from "../../domain/user-service";

export class UsersRepository {
    static async getUserById(id: string): Promise<UsersDbType | null> {
        const user = await usersCollections.findOne({_id: new ObjectId(id)});

        if (!user) {
            return null
        }

        return user
    }


    static async getUserByLoginOrEmail(loginOrEmail: string): Promise<UsersDbType | null> {
        const filter = {
            $or: [{
                login: {
                    $regex: loginOrEmail,
                    $options: "i"
                }
            }, {
                email: {
                    $regex: loginOrEmail,
                    $options: "i"
                }
            }]
        }
        const user = await usersCollections.findOne(filter);

        if (!user) {
            return null
        }

        return user
    }

    static async createUser(createdData: UsersDbType): Promise<string | null> {
        const res = await usersCollections.insertOne(createdData)

        if (!res || !res.insertedId) {
            return null
        }

        return res.insertedId.toString()
    }

    static async deleteUser(id: string): Promise<boolean> {
        const res = await usersCollections.deleteOne({_id: new ObjectId(id)})

        return !!res.deletedCount
    }
}