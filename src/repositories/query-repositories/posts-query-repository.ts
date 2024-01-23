import {postsCollections} from "../../db/mongo";
import {ObjectId} from "mongodb";
import {OutputPostModel} from "../../models/post/output/post.output.models";
import {postMapper} from "../../models/post/mappers/post-mapper";
import {PaginatorType} from "../../models/common";
import {QueryPostInputModels} from "../../models/post/input/query.post.input.models";

export class PostsQueryRepository {
    static async getAllPosts(sortData: QueryPostInputModels): Promise<PaginatorType<OutputPostModel>> {
        const sortBy = sortData.sortBy ?? 'createdAt'
        const sortDirection = sortData.sortDirection ?? 'desc'
        const pageNumber = sortData.pageNumber ?? 1
        const pageSize = sortData.pageSize ?? 10

        const posts = await postsCollections
            .find({})
            .sort(sortBy, sortDirection)
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .toArray();

        const totalCount = await postsCollections.countDocuments()

        const pagesCount = Math.ceil(totalCount / +pageSize);

        return {
            pagesCount: +pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: posts.map(postMapper)
        }
    }

    static async getPostById(id: string): Promise<OutputPostModel | null> {
        const post = await postsCollections.findOne({_id: new ObjectId(id)});

        if (!post) {
            return null
        }

        return postMapper(post)
    }
}