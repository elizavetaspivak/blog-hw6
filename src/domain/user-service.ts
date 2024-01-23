import {UsersDbType} from "../models/db/db.models";
import {CreateUserInputModel} from "../models/user/input/create.user.input.model";
import {OutputUserModel} from "../models/user/output/user.output.models";
import {UsersRepository} from "../repositories/private-repositories/users-repository";
import {AuthService} from "./auth-service";
import {UsersQueryRepository} from "../repositories/query-repositories/users-query-repository";

export class UserService {

    static async createUser(createdUserData: CreateUserInputModel): Promise<OutputUserModel | null> {
        const userPasswordHash = AuthService.generateHash(createdUserData.password)

        const newUser: UsersDbType = {
            email: createdUserData.email,
            login: createdUserData.login,
            passwordHash: userPasswordHash,
            createdAt: new Date().toISOString()
        }

        const createdUserId = await UsersRepository.createUser(newUser)

        if (!createdUserId) {
            return null
        }

        const user = await UsersQueryRepository.getById(createdUserId)

        if (!user) {
            return null
        }

        return user
    }

    static async deleteUser(userId: string): Promise<boolean | null> {
        const post = await UsersRepository.getUserById(userId)

        if (!post) {
            return null;
        }

        return await UsersRepository.deleteUser(userId)
    }
}