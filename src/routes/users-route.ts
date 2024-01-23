import {Router} from "express";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {ObjectId} from "mongodb";
import {
    HTTP_RESPONSE_CODES,
    PaginatorType,
    ParamType,
    RequestTypeWithBody,
    RequestTypeWithParams,
    RequestTypeWithQuery,
    ResponseType
} from "../models/common";
import {userValidation} from "../validators/user-validators";
import {CreateUserInputModel} from "../models/user/input/create.user.input.model";
import {OutputUserModel} from "../models/user/output/user.output.models";
import {UserService} from "../domain/user-service";
import {QueryUserInputModels} from "../models/user/input/query.user.input.models";
import {UsersQueryRepository} from "../repositories/query-repositories/users-query-repository";

export const userRoute = Router({})

userRoute.get('/', async (req: RequestTypeWithQuery<QueryUserInputModels>, res: ResponseType<PaginatorType<OutputUserModel>>) => {
    const sortData = {
        searchEmailTerm: req.query.searchEmailTerm,
        searchLoginTerm: req.query.searchLoginTerm,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        pageNumber: req.query.pageNumber,
        pageSize: req.query.pageSize,
    }

    const users = await UsersQueryRepository.getAll(sortData)

    res.send(users)
})

userRoute.post('/', authMiddleware, userValidation(), async (req: RequestTypeWithBody<CreateUserInputModel>, res: ResponseType<OutputUserModel>) => {
    const {login, email, password} = req.body

    const user = await UserService.createUser({login, email, password})

    if (!user) {
        res.sendStatus(HTTP_RESPONSE_CODES.BAD_REQUEST)
        return
    }

    res.status(HTTP_RESPONSE_CODES.CREATED).send(user)
})

userRoute.delete('/:id', authMiddleware, async (req: RequestTypeWithParams<ParamType>, res: ResponseType<{}>) => {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return
    }

    const isUserDeleted = await UserService.deleteUser(id)

    if (!isUserDeleted) {
        res.sendStatus(HTTP_RESPONSE_CODES.NOT_FOUND)
        return;
    }

    res.sendStatus(HTTP_RESPONSE_CODES.NO_CONTENT)
})