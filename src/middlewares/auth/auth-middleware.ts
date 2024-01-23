import {NextFunction, Request, Response} from "express";
import {HTTP_RESPONSE_CODES} from "../../models/common";
import * as dotenv from "dotenv";

dotenv.config()

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization']

    if (!auth) {
        res.sendStatus(HTTP_RESPONSE_CODES.UNAUTHORIZED)
        return
    }

    const [basic, token] = auth!.split(" ")

    if (basic !== 'Basic') {
        res.sendStatus(HTTP_RESPONSE_CODES.UNAUTHORIZED)
        return
    }

    const decodedData = Buffer.from(token, 'base64').toString()

    const [login, password] = decodedData.split(":")

    if (login !== process.env.LOGIN || password !== process.env.PASSWORD) {
        res.sendStatus(HTTP_RESPONSE_CODES.UNAUTHORIZED)
        return
    }

    return next()
}