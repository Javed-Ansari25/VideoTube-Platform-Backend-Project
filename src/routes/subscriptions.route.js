import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    toggleSubscription, getChannelSubscribers, getUserSubscribedChannels, getSubscriberCount, checkUserSubscribed 
} from "../controllers/subscription.controllers.js";

const router = Router();
router.use(verifyJWT);

// route
router.post("/toggle/:channelId", toggleSubscription);

// Channel subscribers list
router.get("/c/:channelId/subscribers", getChannelSubscribers);

// Channel subscriber count
router.get("/c/:channelId/count", getSubscriberCount);

// Logged-in user subscriptions
router.get("/my-subscriptions", getUserSubscribedChannels);

// Check subscribed or not
router.get("/check/:channelId", checkUserSubscribed);

export default router
