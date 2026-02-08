import { Router } from "express";
import { 
    uploadUserImages, changeCurrentPassword, getCurrentUser, changeUserDetails, 
    updateAvatar, updateCoverImage , getUserChannelProfile, getWatchHistory
} 
from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

// routes
router.post("/upload/images",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  uploadUserImages
);
router.route("/change-password").post(changeCurrentPassword);
router.route("/currentUser").get(getCurrentUser);
router.route("/update-account").patch(changeUserDetails)
router.route("/avatar").patch(upload.single("avatar"), updateAvatar)
router.route("/coverImage").patch(upload.single("coverImage"), updateCoverImage)
router.route("/c/:username").get(getUserChannelProfile)
router.route("/history").get(getWatchHistory)

export default router   
