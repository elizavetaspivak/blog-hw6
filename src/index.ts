import {runDb} from "./db/mongo";
import dotenv from 'dotenv'
import {app} from "./settings";

dotenv.config()

const port: number = process.env.PORT ? +process.env.PORT : 80

app.listen(port, async () => {
    await runDb(port)
})