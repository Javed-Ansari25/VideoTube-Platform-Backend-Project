import { verifyJWT } from "../middlewares/auth.middleware.js";
import loginLimiter from "../middlewares/loginLimiter.middleware.js";
import { registerUser, loginUser, logoutUser, refreshAccessToken} from "../controllers/auth.controllers.js";
import { Router } from "express";

const router = Router();

// routes
router.route("/register").post(registerUser);
router.route("/login").post(loginLimiter, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(refreshAccessToken);

export default router
