import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const {videoId} = req.params;

    if (!content?.trim()) {
        throw new ApiError(400, "Comment field are required");
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated");
    }

    const comment = await Comment.create({
        content : content.trim(),
        video: videoId,
        owner: req.user._id
    })

    res.status(201).json(
        new ApiResponse(201, comment, "Comment added")
    );
})

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    // MATCH - SORT - LOOKUP - UNWIND - PROJECT - PAGINATE
    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $lookup : {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { 
            $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } // If a comment exists but the owner is deleted, $unwind will remove that comment from results.
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: {
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                }
            }
        }

    ]);

    const options = {
        page: Number(page),
        limit: Number(limit)
    }

    const comments = await Comment.aggregatePaginate(aggregate, options);

    res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    );
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findOneAndUpdate(
        {_id: commentId, owner: req.user._id},
        {$set: {content: content.trim()}},
        {new: true}
    )

    if (!comment) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    });

    if (!deletedComment) {
        throw new ApiError(404, "Video not found or unauthorized");
    }
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
})

export {addComment, getVideoComments, updateComment, deleteComment}
