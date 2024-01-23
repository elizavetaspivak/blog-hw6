import * as bcrypt from 'bcrypt'
import {CreateAuthInputModel} from "../models/auth/input/create.auth.input.model";
import {UsersRepository} from "../repositories/private-repositories/users-repository";

export class AuthService {
    static generateHash(password: string): string {
        const saltRounds = 10;

        return bcrypt.hashSync(password, saltRounds);
    }

    static async createAuth(createAuthData: CreateAuthInputModel): Promise<boolean | null>{
        const user = await UsersRepository.getUserByLoginOrEmail(createAuthData.loginOrEmail)

        if (!user){
            return null
        }

        return bcrypt.compareSync(createAuthData.password, user.passwordHash)
    }
}