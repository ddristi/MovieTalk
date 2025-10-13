import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
   origin: process.env.CORS_ORIGIN,
   credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({
    extented:true,
    limit:"16kb"
}
))
app.use{express.static("public")}
app.use(cookieParser())

import postRouter from "./routes/post.routes.js"
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/posts", postRouter)
export {app}