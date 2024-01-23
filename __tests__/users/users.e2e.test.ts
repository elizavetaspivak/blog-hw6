import {app} from "../../src/settings";
import {UsersDataManager} from "./data-manager/users.data.manager";
import {OutputPostModel} from "../../src/models/post/output/post.output.models";
import {ErrorType} from "../../src/models/common";
import {MongoClient} from "mongodb";
import {uri} from "../../src/db/mongo";
import {OutputUserModel} from "../../src/models/user/output/user.output.models";
import {CreateUserInputModel} from "../../src/models/user/input/create.user.input.model";

export enum PossibleErrors {
    LOGIN = 'login',
    EMAIL = 'email',
    PASSWORD = 'password',
}

describe('/users', () => {
    let udm: UsersDataManager

    const client = new MongoClient(uri)

    beforeAll(async () => {
        await client.connect()

        udm = new UsersDataManager(app)

        const auth = udm.prepareAuth()

        await udm.deleteAllDataAndExpectCode(auth)

        expect.setState({auth})
    })

    afterAll(async () => {
        await client.close()
    })

    it('- GET users = []', async () => {
        const users = await udm.reRequestUsers()

        udm.expectPagination(users, 0, 1, 10, 0)

        udm.expectBody<OutputUserModel[]>(users.items, [])
    })

    it('- POST does not create the user with incorrect data (no email, no login, no password)', async function () {
        const {auth} = expect.getState()

        /*
         Data for create Post with incorrect values
         incorrect : title, shortDescription, content, blogId
         */
        const createData = {
            login: '',
            email: '',
            password: '',
        }

        const body = await udm.createNewUserAndExpectCode<CreateUserInputModel>(auth, createData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect login', field: 'login' ],
                                                    [ message: 'Incorrect email', field: 'email' ],
                                                    [ message: 'Incorrect password', field: 'password' ],
       */
        const errorsByKeys = udm.prepareErrorsByKeys([PossibleErrors.LOGIN, PossibleErrors.PASSWORD, PossibleErrors.EMAIL])

        udm.expectBody<ErrorType>(body, errorsByKeys)

        // Check users data not change in DB
        const users = await udm.reRequestUsers()

        udm.expectBody<OutputPostModel[]>(users.items, [])
    })

    it('- POST does not create the user with incorrect data (no password)', async function () {
        const {auth} = expect.getState()

        /*
         Data for create Post with incorrect values
         incorrect : blogId
         */
        const createData = {
            login: 'test1',
            email: 'elizabethspivak99@gmail.com',
            password: ''
        }

        const body = await udm.createNewUserAndExpectCode<CreateUserInputModel>(auth, createData, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect password', field: 'PASSWORD' ]}
         */
        const errorsByKeys = udm.prepareErrorsByKeys([PossibleErrors.PASSWORD])

        udm.expectBody<ErrorType>(body, errorsByKeys)

        // Check users data not change in DB
        const users = await udm.reRequestUsers()

        udm.expectBody<OutputPostModel[]>(users.items, [])
    })

    it('- POST create the user with correct data', async function () {
        const {auth} = expect.getState()

        // Data for create Post with correct values
        const createData = {
            login: 'test1',
            email: 'elizabethspivak99@gmail.com',
            password: 'qwekhvt48263'
        }

        const body = await udm.createNewUserAndExpectCode<CreateUserInputModel>(auth, createData)

        // Check users data change in DB
        const users = await udm.reRequestUsers()

        udm.expectPagination(users, 1, 1, 10, 1)

        udm.expectBody<OutputUserModel[]>(users.items, [{
            id: expect.any(String),
            login: createData.login,
            email: createData.email,
            createdAt: expect.any(String)
        }])

        expect.setState({user: body})
    })

    it('- GET get all users', async function () {
        // Check posts data in DB
        const users = await udm.reRequestUsers()

        udm.expectBodyLength(users.items, 1)
        udm.expectBody<OutputUserModel[]>(users.items, [{
            id: expect.any(String),
            login: 'test1',
            email: 'elizabethspivak99@gmail.com',
            createdAt: expect.any(String)
        }])
    })

    it('- DELETE delete the user with incorrect id', async function () {
        const {auth} = expect.getState()

        await udm.deleteUserAndExpectCode(auth, 'fgsdgfs73874', 404)

        // Check users data not change in DB
        const users = await udm.reRequestUsers()

        udm.expectBodyLength(users.items, 1)
        udm.expectBody<OutputUserModel[]>(users.items, [{
            id: expect.any(String),
            login: 'test1',
            email: 'elizabethspivak99@gmail.com',
            createdAt: expect.any(String)
        }])
    })

    it('- DELETE delete the post with correct id', async function () {
        const {auth, user} = expect.getState()

        await udm.deleteUserAndExpectCode(auth, user.id)

        // Check users data change in DB
        const users = await udm.reRequestUsers()

        udm.expectBodyLength(users.items, 0)
    })
})