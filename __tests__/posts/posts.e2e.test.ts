import {app} from "../../src/settings";
import {PostDataManager} from "./data-manager/post.data.manager";
import {OutputPostModel} from "../../src/models/post/output/post.output.models";
import {ErrorType} from "../../src/models/common";
import {CreatePostModel} from "../../src/models/post/input/create.post.input.models";
import {BlogDataManager} from "../blogs/data-manager/blog.data.manager";
import {CreateBlogModel} from "../../src/models/blog/input/create.blog.input.models";
import {UpdatePostModel} from "../../src/models/post/input/update.post.input.models";
import {MongoClient} from "mongodb";
import {uri} from "../../src/db/mongo";

export enum PossibleErrors {
    TITLE = 'title',
    SHORT_DESCRIPTION = 'shortDescription',
    CONTENT = 'content',
    BLOG_ID = 'blogId',
}

describe('/posts', () => {
    let pdm: PostDataManager
    let bdm: BlogDataManager

    const client = new MongoClient(uri)

    beforeAll(async () => {
        await client.connect()

        pdm = new PostDataManager(app)
        bdm = new BlogDataManager(app)

        const auth = pdm.prepareAuth()

        await pdm.deleteAllDataAndExpectCode(auth)
        await bdm.deleteAllDataAndExpectCode(auth)

        expect.setState({auth})
    })

    afterAll(async () => {
        await client.close()
    })

    it('- GET posts = []', async () => {
        const posts = await pdm.reRequestPosts()

        pdm.expectPagination(posts, 0, 1, 10, 0)

        pdm.expectBody<OutputPostModel[]>(posts.items, [])
    })

    it('- POST does not create the post with incorrect data (no title, no shortDescription, no content, no blogId)', async function () {
        const {auth} = expect.getState()

        /*
         Data for create Post with incorrect values
         incorrect : title, shortDescription, content, blogId
         */
        const createData = {
            title: '',
            shortDescription: '',
            content: '',
            blogId: '',
        }

        const body = await pdm.createNewPostAndExpectCode<CreatePostModel>(auth, createData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect title', field: 'title' ],
                                                    [ message: 'Incorrect shortDescription', field: 'shortDescription' ],
                                                    [ message: 'Incorrect content', field: 'content' ],
                                                    [ message: 'Incorrect blogId', field: 'blogId' ]}
         */
        const errorsByKeys = pdm.prepareErrorsByKeys([PossibleErrors.TITLE, PossibleErrors.SHORT_DESCRIPTION, PossibleErrors.CONTENT, PossibleErrors.BLOG_ID])

        pdm.expectBody<ErrorType>(body, errorsByKeys)

        // Check posts data not change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBody<OutputPostModel[]>(posts.items, [])
    })

    it('- POST does not create the post with incorrect data (no blogId)', async function () {
        const {auth} = expect.getState()

        /*
         Data for create Post with incorrect values
         incorrect : blogId
         */
        const createData = {
            title: 'post 1',
            shortDescription: 'post 1',
            content: 'post 1',
            blogId: '',
        }

        const body = await pdm.createNewPostAndExpectCode<CreatePostModel>(auth, createData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect blogId', field: 'blogId' ]}
         */
        const errorsByKeys = pdm.prepareErrorsByKeys([PossibleErrors.BLOG_ID])

        pdm.expectBody<ErrorType>(body, errorsByKeys)

        // Check posts data not change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBody<OutputPostModel[]>(posts.items, [])
    })

    it('- POST create the post with correct data', async function () {
        const {auth} = expect.getState()

        // Data for create Blog with correct values
        const createBlogData = {
            name: 'blog 1',
            description: 'blog 1',
            websiteUrl: 'https://ru.pngtree.com/'
        }

        const blog = await bdm.createNewBlogAndExpectCode<CreateBlogModel>(auth, createBlogData, 201)


        // Data for create Post with correct values
        const createData = {
            title: 'post 1',
            shortDescription: 'post 1',
            content: 'post 1',
            blogId: blog.id,
        }

        const body = await pdm.createNewPostAndExpectCode<CreatePostModel>(auth, createData)

        // Check posts data change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectPagination(posts, 1, 1, 10, 1)

        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post 1",
            id: expect.any(String),
            shortDescription: "post 1",
            title: "post 1",
            createdAt: expect.any(String)
        }])

        expect.setState({blog: blog, post: body})
    })

    it('- GET get all posts', async function () {
        const {blog} = expect.getState()

        // Check posts data in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 1)
        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post 1",
            id: expect.any(String),
            shortDescription: "post 1",
            title: "post 1",
            createdAt: expect.any(String)
        }])
    })

    it('- GET get post by id', async function () {
        const {blog, post} = expect.getState()

        // Check post data in DB
        const postInDb = await pdm.getByIdAndExpectCode(post.id)

        pdm.expectBody<OutputPostModel>(postInDb, {
            blogId: blog.id,
            blogName: "blog 1",
            content: "post 1",
            id: expect.any(String),
            shortDescription: "post 1",
            title: "post 1",
            createdAt: expect.any(String)
        })
    })

    it('- GET get post by not existed id', async function () {
        const {blog} = expect.getState()

        await pdm.getByIdAndExpectCode('fsdhgfyu43', 404)

        // Check posts data in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 1)
        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post 1",
            id: expect.any(String),
            shortDescription: "post 1",
            title: "post 1",
            createdAt: expect.any(String)
        }])
    })

    it('- PUT does not update the post with incorrect data (no title, no shortDescription)', async function () {
        const {auth, blog, post} = expect.getState()

        /*
         Data for update Post with incorrect values
         incorrect : title, shortDescription
         */
        const updateData = {
            title: '',
            shortDescription: '',
            content: 'post 1',
            blogId: blog.id,
        }

        const body = await pdm.updateNewPostAndExpectCode<UpdatePostModel>(auth, post.id, updateData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect title', field: 'title' ],
                                                    [ message: 'Incorrect shortDescription', field: 'shortDescription' ]}
         */
        const errorsByKeys = pdm.prepareErrorsByKeys([PossibleErrors.TITLE, PossibleErrors.SHORT_DESCRIPTION])

        pdm.expectBody<ErrorType>(body, errorsByKeys)

        // Check posts data not change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 1)
        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post 1",
            id: expect.any(String),
            shortDescription: "post 1",
            title: "post 1",
            createdAt: expect.any(String)
        }])
    })

    it('- PUT does not update the post with incorrect data (invalid blogId)', async function () {
        const {auth, blog, post} = expect.getState()

        /*
         Data for update Post with incorrect values
         incorrect : blogId
         */
        const updateData = {
            title: 'post updated',
            shortDescription: 'post updated',
            content: 'post updated',
            blogId: 'fjhvfsj4u3yt',
        }

        const body = await pdm.updateNewPostAndExpectCode<UpdatePostModel>(auth, post.id, updateData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect blogId', field: 'blogId' ]}
         */
        const errorsByKeys = pdm.prepareErrorsByKeys([PossibleErrors.BLOG_ID])

        pdm.expectBody<ErrorType>(body, errorsByKeys)

        // Check posts data not change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 1)
        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post 1",
            id: expect.any(String),
            shortDescription: "post 1",
            title: "post 1",
            createdAt: expect.any(String)
        }])
    })

    it('- PUT update the post with incorrect id', async function () {
        const {auth, blog,} = expect.getState()

        // Data for create Post with correct values
        const updateData = {
            title: 'post updated',
            shortDescription: 'post updated',
            content: 'post updated',
            blogId: blog.id,
        }

        await pdm.updateNewPostAndExpectCode<UpdatePostModel>(auth, "fsfs543", updateData, 404)

        // Check posts data not change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 1)
        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post 1",
            id: expect.any(String),
            shortDescription: "post 1",
            title: "post 1",
            createdAt: expect.any(String)
        }])
    })

    it('- PUT update the post with correct data', async function () {
        const {auth, blog, post} = expect.getState()

        // Data for create Blog with correct values
        const updateData = {
            title: 'post updated',
            shortDescription: 'post updated',
            content: 'post updated',
            blogId: blog.id,
        }

        await pdm.updateNewPostAndExpectCode<UpdatePostModel>(auth, post.id, updateData)

        // Check posts data change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 1)
        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post updated",
            id: expect.any(String),
            shortDescription: "post updated",
            title: "post updated",
            createdAt: expect.any(String)
        }])
    })

    it('- DELETE delete the post with incorrect id', async function () {
        const {auth, blog} = expect.getState()

        await pdm.deletePostAndExpectCode(auth, 'fgsdgfs73874', 404)

        // Check posts data not change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 1)
        pdm.expectBody<OutputPostModel[]>(posts.items, [{
            blogId: blog.id,
            blogName: "blog 1",
            content: "post updated",
            id: expect.any(String),
            shortDescription: "post updated",
            title: "post updated",
            createdAt: expect.any(String)
        }])
    })

    it('- DELETE delete the post with correct id', async function () {
        const {auth, post} = expect.getState()

        await pdm.deletePostAndExpectCode(auth, post.id)

        // Check posts data change in DB
        const posts = await pdm.reRequestPosts()

        pdm.expectBodyLength(posts.items, 0)
    })
})