import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import deleteLocalFile from '../utils/deleteLocalFile.js';

const uploadUserImages = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverPath = req.files?.coverImage?.[0]?.path;

  if (!avatarPath && !coverPath) {
    throw new ApiError(400, "Please upload avatar or cover image");
  }

  let updateData = {};

  if (avatarPath) {
    const avatar = await uploadOnCloudinary(avatarPath, "image");
    if (!avatar?.url) {
      throw new ApiError(400, "Avatar upload failed");
    }
    updateData.avatar = avatar.url;
  }

  if (coverPath) {
    const cover = await uploadOnCloudinary(coverPath, "image");
    if (cover?.url) {
      updateData.coverImage = cover.url;
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  ).select("username avatar coverImage");

  return res.status(200).json(
    new ApiResponse(200, user, "Profile images updated successfully")
  );
});

const getCurrentUser = asyncHandler(async(req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new password are required");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.isPasswordCorrect(oldPassword);

  if (!isMatch) {
    throw new ApiError(400, "Old password is incorrect");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password must be different");
  }

  user.password = newPassword;
  await user.save(); 

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  );
})

const changeUserDetails = asyncHandler(async(req, res) => {
  const {fullName, email} = req.body;
  if(!fullName || !email) {
    throw new ApiError(201, "All field are require")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email
      }
    },
    {
      new : true
    }
  ).select("-refreshToken")

  return res.status(200).json(
    new ApiResponse(200, user, "Account details update successfully")
  )
})  

const updateAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path;
  if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is messing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath, "image");
  if(!avatar?.url) {
    throw new ApiError(400, "Error on while upload time")
  }
  // delete local file
  deleteLocalFile(avatarLocalPath);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {
      new: true,
      select: "username coverImage" 
    }
  )

  return res.status(200).json(
    new ApiResponse(200, { avatar: user.avatar }, "Avatar update successfully")
  )
})

const updateCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path;
  if(!coverImageLocalPath) {
    throw new ApiError(400, "coverImage image file is messing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath, "image");
  if(!coverImage?.url) {
    throw new ApiError(400, "Error on while upload time")
  }
  // delete local file
  deleteLocalFile(coverImageLocalPath);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {
      new: true,
      select: "username coverImage" 
    }
  )

  return res.status(200).json(
    new ApiResponse(200, {coverImage: user.coverImage}, "coverImage file update successfully")
  )
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
  const {username} = req.params;

  if(!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match:{username: username?.toLowerCase()}
    },

    // Subscribers find
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },

    // Subscribed find
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },

    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        subscribedToCount: { $size: "$subscribedTo" },

        isSubscribed: {
          $cond: {
            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },

    {
      $project: {
        password: 0,
        refreshToken: 0,
        subscribers: 0,
        subscribedTo: 0
      }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res.status(200).json(
    new ApiResponse(200, channel[0], "user channel fetched successfully")
  )
})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {_id: new mongoose.Types.ObjectId(req.user._id)}
    },

    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",

              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  }
                }
              ]

            }
          },
          
          // convert the owner array into a single object using $first.
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }

        ]
      }
    }
  ])

  return res.status(200).json(
    new ApiResponse(200, user[0].watchHistory, "watchHistory fetched successfully")
  )
})

export { 
  changeCurrentPassword, getCurrentUser, changeUserDetails, updateAvatar,
  updateCoverImage , getUserChannelProfile, getWatchHistory, uploadUserImages
};
