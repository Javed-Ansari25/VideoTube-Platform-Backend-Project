import mongoose from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet");
    }

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    );
})

const getAllTweets = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tweets = await Tweet.find()
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(200, tweets, "Tweets fetched successfully")
  );
});

const getUserTweetsByID = asyncHandler(async (req, res) => {
   const { userId } = req.params;

   if(!mongoose.Types.ObjectId.isValid(userId)) {
     throw new ApiError(400, "Invalid userId");
   }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tweet = await Tweet.findById(userId)
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

    return res.status(200).json(
        new ApiResponse(200, tweet, "User Tweet fetched successfully")
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    const {content} = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet not found");
    }

    if(!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findOneAndUpdate(
        {_id: tweetId, owner: req.user._id},
        {$set: {content: content.trim()}},
        {new: true}
    )

    if (!tweet) {
        throw new ApiError(404, "tweet not found or unauthorized");
    }

    res.status(200).json(
        new ApiResponse(200, tweet, "Comment updated successfully")
    );
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const deletedTweetId = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id
    });

    if (!deletedTweetId) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
})

export {createTweet, getAllTweets, getUserTweetsByID, updateTweet, deleteTweet}
