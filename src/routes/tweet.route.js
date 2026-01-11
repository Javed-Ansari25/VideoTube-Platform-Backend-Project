import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, getAllTweets, getUserTweetsByID, updateTweet, deleteTweet } from "../controllers/tweets.controllers.js";

const router = Router();
router.use(verifyJWT); 

// routes
router.route("/")
.post(createTweet)
.get(getAllTweets)

router.route("/:userId")
.get(getUserTweetsByID)

router.route("/:tweetId")
.patch(updateTweet)
.delete(deleteTweet)

export default router
