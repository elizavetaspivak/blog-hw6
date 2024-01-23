import express from "express";
import {deleteAllDataRoute} from "./routes/delete-all-data-route";
import {blogRoute} from "./routes/blog-route";
import {postRoute} from "./routes/post-route";
import {userRoute} from "./routes/users-route";
import {authRoute} from "./routes/auth-route";

export const app = express()

app.use(express.json())

app.use('/testing/all-data', deleteAllDataRoute)
app.use('/blogs', blogRoute)
app.use('/posts', postRoute)
app.use('/users', userRoute)
app.use('/auth', authRoute)