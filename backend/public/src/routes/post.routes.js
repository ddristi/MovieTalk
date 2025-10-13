import import {upload} from "../middlewars/multer.middleware.js"
import {verifyJWT} from "../middlewars/auth.middleware.js"
import {Router} from "express"
import {createPost,
        updatePost,
        deletePost,
        getAllPost,
        getPostbyId
} from "../controllers/post.controller.js"

const router = Router()
router.use(verifyJWT)
router.route("/")
.get(getAllPost)
.post(upload.fields({
    name: "movieImage",
    maxCount: 1
}), createPost)
router.route("/post/:id")
.get(getPostbyId)
.delete(deletePost)
.patch(upload.single("movieImage"),updatePost)

export default router