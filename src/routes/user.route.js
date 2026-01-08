import { Router } from "express";
import { 
    registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, 
    changeUserDetails, updateAvatar, updateCoverImage , getUserChannelProfile, getWatchHistory
} 
from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/getCurrent-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, changeUserDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router   
