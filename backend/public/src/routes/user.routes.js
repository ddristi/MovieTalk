import {Router} from "express"
import {registerUser,
        loginUser,
        logoutUser,
        updatePassword,
        updateProfile,
        getUser,
        getPost,
        updateProfilePhoto
} from "../controllers/user.controller.js"

import {upload} from "../middlewars/multer.middleware.js"
import {verifyJWT} from "../middlewars/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.single(
       "profilePhoto"
    ),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,  logoutUser)
//router.route("/refresh-token").post(refreshAccessToken)

router.route("change-password").post(verifyJWT, updatePassword)
router.route("update-profile").patch(verifyJWT, updateProfile)
router.route("/c/:username").get(verifyJWT,getPost)
router.route("current-user").get(verifyJWT,getUser)

router.route("profile-photo").patch(verifyJWT, upload.single("profilePhoto"), updateProfilePhoto)

export default router