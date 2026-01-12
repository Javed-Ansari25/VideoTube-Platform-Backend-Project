import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  // user kud ko hi subscribe na kar li
  if (userId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const unSubscription = await Subscription.findOneAndDelete({
    channel: channelId,
    subscriber: userId
  });

  if (unSubscription) {
    return res.status(200).json(
      new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully")
    );
  }

  await Subscription.create({
    channel: channelId,
    subscriber: userId
  });

  return res.status(201).json(
    new ApiResponse(201, { isSubscribed: true }, "Subscribed successfully")
  );
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username avatar");

  return res.status(200).json(
    new ApiResponse(200, {totalSubscribers: subscribers.length, subscribers})
  );
});

const getUserSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const channels = await Subscription.find({ subscriber: userId })
        .populate("channel", "username avatar");

    return res.status(200).json(
        new ApiResponse(200, {totalSubscriptions: channels.length, channels})
    );
});

const getSubscriberCount = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const count = await Subscription.countDocuments({ channel: channelId });

  return res.status(200).json(
    new ApiResponse(200, { subscribers: count })
  );
});

const checkUserSubscribed = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(200).json(
        new ApiResponse(200, { isSubscribed: Boolean(isSubscribed)})
    );
});

export {toggleSubscription, getChannelSubscribers, getUserSubscribedChannels, getSubscriberCount, checkUserSubscribed}
