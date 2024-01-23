import {blogsCollections, postsCollections, usersCollections} from "../../db/mongo";
import {ObjectId} from "mongodb";
import {blogMapper} from "../../models/blog/mappers/blog-mapper";
import {OutputBlogType} from "../../models/blog/output/blog.output.models";
import {PaginatorType} from "../../models/common";
import {OutputPostModel} from "../../models/post/output/post.output.models";
import {QueryBlogInputModels} from "../../models/blog/input/query.blog.input.models";
import {QueryPostInputModels} from "../../models/post/input/query.post.input.models";
import {OutputUserModel} from "../../models/user/output/user.output.models";
import {userMapper} from "../../models/user/mappers/user-mapper";
import {QueryUserInputModels} from "../../models/user/input/query.user.input.models";

export class UsersQueryRepository {
    static async getAll(sortData: QueryUserInputModels): Promise<PaginatorType<OutputUserModel>> {
        const searchLoginTerm = sortData.searchLoginTerm ?? null
        const searchEmailTerm = sortData.searchEmailTerm ?? null
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = sortData.pageSize ?? 10

        let filter = []

        if (searchEmailTerm){
            filter.push({
                email: {
                    $regex: searchEmailTerm,
                    $options: "i"}})
        }

        if (searchLoginTerm){
            filter.push({
                login: {
                    $regex: searchLoginTerm,
                    $options: "i"}})
        }

        const users = await usersCollections
            .find(filter.length ? {$or: filter}: {})
            .sort(sortBy, sortDirection)
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray();

        const totalCount = await usersCollections.countDocuments(filter.length ? {$or: filter}: {})

        const pagesCount = Math.ceil(totalCount / +pageSize);

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: users.map(userMapper)
        }
    }

    static async getById(userId: string): Promise<OutputUserModel | null> {
        const user = await usersCollections
            .findOne({_id: new ObjectId(userId)})

        if (!user) {
            return null
        }

        return userMapper(user)
    }
}