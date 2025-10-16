import {upload} from "../middlewars/multer.middleware.js"
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
router.route("/create-post").post(upload.single("movieImage"), createPost)
router.route("/get-post").get(getAllPost)

router.route("/post/:id").get(getPostbyId)
router.route("/post/:id/delete-post").delete(deletePost)
router.route("/post/:id/update-post").patch(updatePost)

export default router