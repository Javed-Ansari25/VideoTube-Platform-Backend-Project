import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, getVideoComments, updateComment, deleteComment} from "../controllers/comment.controllers.js";
import commentLimiter from "../middlewares/commentLimiter.middleware.js";

const router = Router();
router.use(verifyJWT) // // Apply verifyJWT middleware to all routes in this file

// routes
router.route("/:videoId")
.post(commentLimiter, addComment)
.get(getVideoComments)

router.route("/c/:commentId")
.patch(updateComment)
.delete(deleteComment)

export default router
