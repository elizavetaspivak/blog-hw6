import {app} from "../../src/settings";
import {MongoClient} from "mongodb";
import {describe} from "node:test";
import {BlogDataManager} from "./data-manager/blog.data.manager";
import {uri} from "../../src/db/mongo";
import {OutputBlogType} from "../../src/models/blog/output/blog.output.models";
import {CreateBlogModel} from "../../src/models/blog/input/create.blog.input.models";
import {ErrorType} from "../../src/models/common";

export enum PossibleErrors {
    NAME = 'name',
    DESCRIPTION = 'description',
    WEBSITE_URL = 'websiteUrl',
}

describe('/blogs', () => {

    let bdm: BlogDataManager

    const client = new MongoClient(uri)

    beforeAll(async () => {
        await client.connect()

        bdm = new BlogDataManager(app)

        const auth = bdm.prepareAuth()

        await bdm.deleteAllDataAndExpectCode(auth)

        expect.setState({auth})
    })

    afterAll(async () => {
        await client.close()
    })

    it('- GET blogs = []', async () => {
        // Check blogs data empty in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectPagination(blogs, 0, 1, 10, 0)

        bdm.expectBody<OutputBlogType[]>(blogs.items, [])
    })

    it('- POST does not create the blog with incorrect data (no name, no description, no websiteUrl)', async function () {
        const {auth} = expect.getState()

        /*
         Data for create Blog with incorrect values
         incorrect : name, description, websiteUrl
         */
        const createData = {
            name: '',
            description: '',
            websiteUrl: ''
        }

        const body = await bdm.createNewBlogAndExpectCode<CreateBlogModel>(auth, createData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect name', field: 'name' ],
                                                    [ message: 'Incorrect description', field: 'description' ],
                                                    [ message: 'Incorrect websiteUrl', field: 'websiteUrl' ]}
         */
        const errorsByKeys = bdm.prepareErrorsByKeys([PossibleErrors.NAME, PossibleErrors.DESCRIPTION, PossibleErrors.WEBSITE_URL])

        bdm.expectBody<ErrorType>(body, errorsByKeys)

        // Check blogs data not change in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectPagination(blogs, 0, 1, 10, 0)

        bdm.expectBody<OutputBlogType[]>(blogs.items, [])
    })

    it('- POST create the blog with correct data', async function () {
        const {auth} = expect.getState()

        // Data for create Blog with correct values
        const createData = {
            name: 'blog 1',
            description: 'blog 1',
            websiteUrl: 'https://ru.pngtree.com/'
        }

        const blog = await bdm.createNewBlogAndExpectCode<CreateBlogModel>(auth, createData, 201)

        // Check blogs data change in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectPagination(blogs, 1, 1, 10, 1)

        bdm.expectBodyLength(blogs.items, 1)
        bdm.expectBody<OutputBlogType[]>(blogs.items, [{
            description: "blog 1",
            id: expect.any(String),
            name: "blog 1",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        }])

        expect.setState({blog: blog})
    })

    it('- GET get all blogs', async function () {
        // Check blogs data in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectBodyLength(blogs.items, 1)
        bdm.expectBody<OutputBlogType[]>(blogs.items, [{
            description: "blog 1",
            id: expect.any(String),
            name: "blog 1",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        }])
    })

    it('- GET get blog by id', async function () {
        const {blog} = expect.getState()

        // Check blog data in DB
        const blogInDb = await bdm.getByIdAndExpectCode(blog.id)

        bdm.expectBody<OutputBlogType>(blogInDb, {
            description: "blog 1",
            id: expect.any(String),
            name: "blog 1",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        })
    })

    it('- GET get blog by not existed id', async function () {
        const blogInDb = await bdm.getByIdAndExpectCode('fvhsdvhs4342', 404)

        // Check blogs data in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectBodyLength(blogs.items, 1)
        bdm.expectBody<OutputBlogType[]>(blogs.items, [{
            description: "blog 1",
            id: expect.any(String),
            name: "blog 1",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        }])
    })

    it('- PUT does not update the blog with incorrect data (no name, no description, no websiteUrl)', async function () {
        const {auth, blog} = expect.getState()

        /*
         Data for update Blog with incorrect values
         incorrect : name, description, websiteUrl
         */
        const updateData = {
            name: '',
            description: '',
            websiteUrl: ''
        }

        const body = await bdm.updateNewBlogAndExpectCode<CreateBlogModel>(auth, blog.id, updateData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect name', field: 'name' ],
                                                    [ message: 'Incorrect description', field: 'description' ],
                                                    [ message: 'Incorrect websiteUrl', field: 'websiteUrl' ]}
         */
        const errorsByKeys = bdm.prepareErrorsByKeys([PossibleErrors.NAME, PossibleErrors.DESCRIPTION, PossibleErrors.WEBSITE_URL])

        bdm.expectBody<ErrorType>(body, errorsByKeys)

        // Check blogs data not change in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectBodyLength(blogs.items, 1)
        bdm.expectBody<OutputBlogType[]>(blogs.items, [{
            description: "blog 1",
            id: expect.any(String),
            name: "blog 1",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        }])
    })

    it('- PUT update the blog with incorrect id', async function () {
        const {auth} = expect.getState()

        // Data for create Blog with correct values
        const updateData = {
            name: 'blog updated',
            description: 'blog updated',
            websiteUrl: 'https://ru.pngtree.com/'
        }

        await bdm.updateNewBlogAndExpectCode<CreateBlogModel>(auth, "fsfs543", updateData, 404)

        // Check blogs data not change in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectBodyLength(blogs.items, 1)
        bdm.expectBody<OutputBlogType[]>(blogs.items, [{
            description: "blog 1",
            id: expect.any(String),
            name: "blog 1",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        }])
    })

    it('- PUT update the blog with correct data', async function () {
        const {auth, blog} = expect.getState()


        // Data for create Blog with correct values
        const updateData = {
            name: 'blog updated',
            description: 'blog updated',
            websiteUrl: 'https://ru.pngtree.com/'
        }

        await bdm.updateNewBlogAndExpectCode<CreateBlogModel>(auth, blog.id, updateData)

        // Check blogs data change in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectBodyLength(blogs.items, 1)
        bdm.expectBody<OutputBlogType[]>(blogs.items, [{
            description: "blog updated",
            id: expect.any(String),
            name: "blog updated",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        }])
    })

    it('- DELETE delete the blog with incorrect id', async function () {
        const {auth} = expect.getState()

        await bdm.deleteBlogAndExpectCode(auth, 'fgsdgfs73874', 404)

        // Check blogs data not change in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectBodyLength(blogs.items, 1)
        bdm.expectBody<OutputBlogType[]>(blogs.items, [{
            description: "blog updated",
            id: expect.any(String),
            name: "blog updated",
            websiteUrl: "https://ru.pngtree.com/",
            createdAt: expect.any(String),
            isMembership: false
        }])
    })

    it('- DELETE delete the blog with correct id', async function () {
        const {auth, blog} = expect.getState()

        await bdm.deleteBlogAndExpectCode(auth, blog.id)

        // Check blogs data change in DB
        const blogs = await bdm.reRequestBlogs()

        bdm.expectBodyLength(blogs.items, 0)
    })
})