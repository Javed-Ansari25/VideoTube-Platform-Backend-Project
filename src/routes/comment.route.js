import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, getVideoComments, updateComment, deleteComment} from "../controllers/comment.controllers.js";

const router = Router();
router.use(verifyJWT) // // Apply verifyJWT middleware to all routes in this file

// routes


export default router