import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import deleteLocalFile from '../utils/deleteLocalFile.js';

// This API returns published videos with search, sorting and pagination using aggregation.
const getAllVideos = asyncHandler(async (req, res) => {
  const {page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId} = req.query;

  // Match stage
  const matchStage = {
    isPublished: true,
  };

  // Search by title
  if (query) {
    matchStage.title = { $regex: query, $options: 'i' };
  }

  // Filter by userId (only if provided)
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid userId');
    }

    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // Aggregation pipeline
  const aggregate = Video.aggregate([
    { $match: matchStage },
    {
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
    },
  ]);

  // Pagination options
  const options = {
    page: Number(page),
    limit: Number(limit),
  };

  // Execute aggregation with pagination
  const videos = await Video.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, 'Videos fetched successfully'));
});

// Video and thumbnail are uploaded to cloud storage and their URLs are saved in database.
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;

  // Validate text fields
  if (!title || !description || !duration) {
    throw new ApiError(400, "All fields are required");
  }

  // Get files from request (multer)
  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  // Upload files to Cloudinary
  const videoUpload = await uploadOnCloudinary(videoFileLocalPath, "video");
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath, "image");

  if (!videoUpload?.url) {
    throw new ApiError(400, "Video upload failed");
  }

  if (!thumbnailUpload?.url) {
    throw new ApiError(400, "Thumbnail upload failed");
  }

  // Create video document 
  const newVideo = await Video.create({
    title,
    description,
    duration,
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    owner: req.user._id,
    isPublished: true 
  });

  return res.status(201).json(
    new ApiResponse(201, newVideo, "Video published successfully")
  );
});

// Every time a video is watched, view count is increased.
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  // Find video + populate owner
  const video = await Video.findById(videoId).populate(
    "owner",
    "username avatar"
  );

  // Check existence & publish status
  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  // Increase views
  video.views += 1;
  await video.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, video, "Video fetched successfully")
  );
});

// Only the video owner can update its details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  // Validate videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Prepare update object
  const updateFields = {};

  if (title) updateFields.title = title.trim();
  if (description) updateFields.description = description.trim();

  // Handle optional thumbnail
  if (req.file?.path) {
    const thumbnailUpload = await uploadOnCloudinary(req.file.path, "image");
    if (!thumbnailUpload?.url) {
      throw new ApiError(400, "Thumbnail upload failed");
    }
    deleteLocalFile(req.file.path);
    updateFields.thumbnail = thumbnailUpload.url;
  }

  // Atomic update or authorization
  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// Authorization ensures only the owner can delete the video.
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Validate videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Atomic delete or authorization check
  const deletedVideo = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id
  });

  // Handle not found or unauthorized
  if (!deletedVideo) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// This API allows creators to control video visibility.
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },   // auth + filter
    [
      {
        $set: {
          isPublished: { $not: "$isPublished" }
        }
      }
    ],
    { new: true, updatePipeline: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, video, "Publish status toggled successfully")
  );
});

export {getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}
