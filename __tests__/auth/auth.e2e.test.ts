import {app} from "../../src/settings";
import {AuthDataManager} from "./data-manager/auth.data.manager";
import {OutputPostModel} from "../../src/models/post/output/post.output.models";
import {ErrorType} from "../../src/models/common";
import {MongoClient} from "mongodb";
import {uri} from "../../src/db/mongo";
import {OutputUserModel} from "../../src/models/user/output/user.output.models";
import {CreateUserInputModel} from "../../src/models/user/input/create.user.input.model";
import {authRoute} from "../../src/routes/auth-route";
import {CreateAuthInputModel} from "../../src/models/auth/input/create.auth.input.model";

export enum PossibleErrors {
    LOGINOREMAIL = 'loginOrEmail',
    PASSWORD = 'password',
}

describe('/auth', () => {
    let adm: AuthDataManager

    const client = new MongoClient(uri)

    beforeAll(async () => {
        await client.connect()

        adm = new AuthDataManager(app)

        const auth = adm.prepareAuth()

        await adm.deleteAllDataAndExpectCode(auth)

        expect.setState({auth})
    })

    afterAll(async () => {
        await client.close()
    })

    it('- POST does not create the auth with incorrect data (incorrect loginOrEmail, incorrect password)', async function () {
        await adm.createLoginAndExpectCode<CreateAuthInputModel>({loginOrEmail: 'fsjkyf', password: 'fjbksdftkee'}, 401)
    })

    it('- POST login successes', async () => {
        const {auth} = expect.getState()

        const createData = {
            login: 'test1',
            email: 'elizabethspivak99@gmail.com',
            password: 'qwekhvt48263'
        }

        await adm.createNewUserAndExpectCode<CreateUserInputModel>(auth, createData)

        await adm.createLoginAndExpectCode<CreateAuthInputModel>({loginOrEmail: 'test1', password: 'qwekhvt48263'})
    })

    it('- POST does not create the auth with incorrect data (no loginOrEmail, no password)', async function () {
        const body = await adm.createLoginAndExpectCode<CreateAuthInputModel>({loginOrEmail: '', password: ''}, 400)

        /*
            Prepare Errors Data for check
            In this case it be - { errorsMessages : [ message: 'Incorrect loginOrEmail', field: 'loginOrEmail' ],
                                                    [ message: 'Incorrect password', field: 'password' ],
       */
        const errorsByKeys = adm.prepareErrorsByKeys([PossibleErrors.LOGINOREMAIL, PossibleErrors.PASSWORD])

        adm.expectBody<ErrorType>(body, errorsByKeys)
    })
})