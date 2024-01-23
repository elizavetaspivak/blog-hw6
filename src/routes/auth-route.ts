import {Router} from "express";
import {HTTP_RESPONSE_CODES, RequestTypeWithBody, ResponseType} from "../models/common";
import {OutputUserModel} from "../models/user/output/user.output.models";
import {UserService} from "../domain/user-service";
import {CreateAuthInputModel} from "../models/auth/input/create.auth.input.model";
import {authValidation} from "../validators/auth-validation";
import {AuthService} from "../domain/auth-service";

export const authRoute = Router({})

authRoute.post('/login', authValidation(), async (req: RequestTypeWithBody<CreateAuthInputModel>, res: ResponseType<OutputUserModel>) => {
    const {loginOrEmail, password} = req.body

    const isAuth = await AuthService.createAuth({loginOrEmail, password})

    if (!isAuth) {
        res.sendStatus(HTTP_RESPONSE_CODES.UNAUTHORIZED)
        return
    }

    res.sendStatus(HTTP_RESPONSE_CODES.NO_CONTENT)
})