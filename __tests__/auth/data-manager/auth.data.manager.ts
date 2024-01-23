import request from "supertest";
import {Express} from "express";
import {app} from "../../../src/settings";
import dotenv from "dotenv";
import {ErrorType, PaginatorType} from "../../../src/models/common";
import {PossibleErrors} from "../auth.e2e.test";

dotenv.config()

export class AuthDataManager {

    private readonly basePath = '/auth'
    private readonly usersBasePath = '/users'
    private readonly deletePath = '/testing/all-data'

    constructor(private readonly app: Express) {
    }

    prepareAuth(): { login: string, password: string } {
        return {login: process.env.LOGIN!, password: process.env.PASSWORD!}
    }

    async createLoginAndExpectCode<D extends object>(createData: D, expectedCode: number = 204) {
        const res = await request(this.app)
            .post(this.basePath + '/' + 'login')
            .send(createData)
            .expect(expectedCode)

        return res.body;
    }

    async deleteAllDataAndExpectCode(authData: {
        login: string,
        password: string
    }, expectedCode: number = 204) {
        await request(this.app)
            .delete(this.deletePath)
            .auth(authData.login, authData.password)
            .expect(expectedCode)
    }

    async createNewUserAndExpectCode<D extends object>(authData: {
        login: string,
        password: string
    }, createData: D, expectedCode: number = 201) {
        const res = await request(this.app)
            .post(this.usersBasePath)
            .auth(authData.login, authData.password)
            .send(createData)
            .expect(expectedCode)

        return res.body;
    }

    async reRequestUsers(expectedCode: number = 200) {
        const res = await request(app).get(this.basePath).expect(expectedCode);

        return res.body;
    }

    prepareErrorsByKeys(keys: PossibleErrors[]) {
        const errors: ErrorType = {
            errorsMessages: []
        }

        keys.forEach(key => {
            errors.errorsMessages.push({message: `Incorrect ${key}`, field: key})
        })

        return errors
    }

    expectBody<D>(data: D, expectedData: D) {
        expect(data).toEqual(expectedData)
    }
}