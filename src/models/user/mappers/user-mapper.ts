import {WithId} from "mongodb";
import {UsersDbType} from "../../db/db.models";
import {OutputUserModel} from "../output/user.output.models";

export const userMapper = (user: WithId<UsersDbType>): OutputUserModel => {
    return {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
    }
}