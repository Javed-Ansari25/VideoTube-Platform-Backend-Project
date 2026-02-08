import mongoose from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    if (!name || !name?.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }

    if(!mongoose.Types.ObjectId.isValid(req.user?._id)) {
        throw new ApiError(400, "Invalid user");
    } 

    const playList = await PlayList.create({
        name : name?.trim(),
        description : description,
        owner: req.user?._id,
        videos: []
    })

    return res.status(201).json(
        new ApiResponse(201, playList, "Playlist created successfully")
    );
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    const playList = await PlayList.find({
        owner : userId
    }).populate("videos")

    if(!playList) {
        throw new ApiError(404, "PlayList not fount")
    }

    return res.status(200).json(
        new ApiResponse(200, playList, "User playlists fetched successfully")
    ); 
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playList = await PlayList.findById(playlistId)
    .populate("videos")
    .populate("owner" , "username avatar")

    if(!playList) {
        throw new ApiError(404, "PlayList not found")
    }

    return res.status(200).json(
        new ApiResponse(200, playList, "Playlist fetched successfully")
    ); 
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid playlist or video id");
    }

    const playList = await PlayList.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $addToSet : {videos : videoId}
        },
        {
            new: true
        }
    )    

    if (!playList) {
        throw new ApiError(404, "Playlist not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, playList, "Video added to playlist successfully")
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (
        !mongoose.Types.ObjectId.isValid(playlistId) ||
        !mongoose.Types.ObjectId.isValid(videoId)
    ) {
        throw new ApiError(400, "Invalid playlist or video id")
    }

    const playList = await PlayList.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $pull: { videos: videoId }   // sirf video remove hoga
        },
        {
            new: true
        }
    )

    if (!playList) {
        throw new ApiError(404, "Playlist not found or unauthorized")
    }

    return res.status(200).json(
        new ApiResponse(200, playList, "Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
    
    const deletedPlaylist = await PlayList.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    });
    
    if (!deletedPlaylist) {
        throw new ApiError(404, "Video not found or unauthorized");
    }
        
    return res.status(200).json(
        new ApiResponse(200, {}, "playlist deleted successfully")
    );
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const updateFields = {};

  if (name !== undefined) {
    if (name.trim() === "") {
      throw new ApiError(400, "Playlist name cannot be empty");
    }
    updateFields.name = name.trim();
  }

  if (description !== undefined) {
    updateFields.description = description.trim();
  }

  // Nothing to update check
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const playList = await PlayList.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $set: updateFields },
    { new: true }
  );

  if (!playList) {
    throw new ApiError(404, "Playlist not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, playList, "Playlist updated successfully")
  );
});

export {createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist}
