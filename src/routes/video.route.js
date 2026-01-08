import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controllers.js";

const router = Router();

// routes
router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);
router.route("/").post(verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
);

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);
router.route("/:videoId")
.patch(verifyJWT, upload.single("thumbnail"), updateVideo)
.delete(verifyJWT, deleteVideo);

export default router;
