import request from "supertest";
import {Express} from "express";
import {app} from "../../../src/settings";
import dotenv from "dotenv";
import {PossibleErrors} from "../blogs.e2e.test";
import {ErrorType, PaginatorType} from "../../../src/models/common";

dotenv.config()

export class BlogDataManager {

    private readonly basePath = '/blogs'
    private readonly deletePath = '/testing/all-data'

    constructor(private readonly app: Express) {
    }

    prepareAuth(): { login: string, password: string } {
        return {login: process.env.LOGIN!, password: process.env.PASSWORD!}
    }

    async getByIdAndExpectCode(id: string, expectedCode: number = 200) {
        const blog = await request(this.app)
            .get(this.basePath + '/' + id)
            .expect(expectedCode)

        return blog.body
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

    async createNewBlogAndExpectCode<D extends object>(authData: {
        login: string,
        password: string
    }, createData: D, expectedCode: number = 201) {
        const res = await request(this.app)
            .post(this.basePath)
            .auth(authData.login, authData.password)
            .send(createData)
            .expect(expectedCode)

        return res.body;
    }

    async updateNewBlogAndExpectCode<D extends object>(authData: {
        login: string,
        password: string
    }, id: string, updateData: D, expectedCode: number = 204) {
        const res = await request(this.app)
            .put(this.basePath + '/' + id)
            .auth(authData.login, authData.password)
            .send(updateData)
            .expect(expectedCode)

        return res.body;
    }

    async deleteBlogAndExpectCode(authData: {
        login: string,
        password: string
    }, id: string, expectedCode: number = 204) {
        const res = await request(this.app)
            .delete(this.basePath + '/' + id)
            .auth(authData.login, authData.password)
            .expect(expectedCode)

        return res.body;
    }

    async reRequestBlogs(expectedCode: number = 200) {
        const res = await request(app).get(this.basePath).expect(expectedCode);

        return res.body;
    }

    public expectPagination<D>(
        body: PaginatorType<D>,
        count: number,
        page: number,
        pageSize: number,
        totalCount: number,
    ) {
        expect(body.items.length).toBe(count);
        expect(body.page).toBe(page);
        expect(body.pageSize).toBe(pageSize);
        expect(body.totalCount).toBe(totalCount);
        expect(body.pagesCount).toBe(Math.ceil(totalCount / pageSize));
    }

    async expectCounts<I>(arr: I[], count: number) {
        expect(arr.length).toBe(count);
    }

    expectBody<D>(data: D, expectedData: D) {
        expect(data).toEqual(expectedData)
    }

    expectBodyLength<D extends Array<any>>(data: Array<D>, expectedDataLength: number) {
        expect(data.length).toEqual(expectedDataLength)
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
}