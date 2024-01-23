import * as dotenv from "dotenv";
import {MongoClient} from "mongodb";
import {BlogDbType, PostDbType, UsersDbType} from "../models/db/db.models";

dotenv.config()

export const uri = process.env.MONGO_URL || 'mongodb+srv://liza:liza@blogs.3awsprb.mongodb.net/?retryWrites=true&w=majority' ;

export const client = new MongoClient(uri);

export const database = client.db('blogs')

export const blogsCollections = database.collection<BlogDbType>('blogs')
export const postsCollections = database.collection<PostDbType>('posts')
export const usersCollections = database.collection<UsersDbType>('users')

export const runDb = async (port: number) => {
    try {
        await client.connect();
        console.log(`Client connected to DB`)
        console.log(`Example app listening on port ${port}`)
    } catch (err) {
        console.log(`${err}`)
        await client.close()
    }
}