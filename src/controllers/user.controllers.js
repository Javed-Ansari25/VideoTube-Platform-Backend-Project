import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import deleteLocalFile from '../utils/deleteLocalFile.js';
import jtw from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.accessTokenGenerate();
    const refreshToken = user.refreshTokenGenerate();    

    user.refreshToken = refreshToken;
    await user.save({ValidateBeforeSave: false});

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(401, "Some thing went wrong, Access and Refresh token generate");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (!username || !email || !fullName || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.exists({
    $or: [{ email }, { username }]
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverPath = req.files?.coverImage?.[0]?.path;

  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload avatar first
  const avatar = await uploadOnCloudinary(avatarPath, "image");
  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  let coverImageUrl = "";
  if (coverPath) {
    const cover = await uploadOnCloudinary(coverPath, "image");
    coverImageUrl = cover?.url || "";
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImageUrl
  });

  const userResponse = {
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    coverImage: user.coverImage,
  };

  return res
    .status(201)
    .json(
      new ApiResponse(201, userResponse, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!password || (!email && !username)) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  }).select("+password +loginAttempts +lockUntil");

  if (!user) {
    throw new ApiError(404, "Invalid credentials");
  }

  // account locked check
  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new ApiError(403, "Account locked. Try again later");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    const updates = {
      $inc: { loginAttempts: 1 }
    };

    if (user.loginAttempts + 1 >= 5) {
      updates.$set = {
        lockUntil: Date.now() + 10 * 60 * 1000
      };
    }

    await User.updateOne({ _id: user._id }, updates);
    throw new ApiError(401, "Invalid credentials");
  }

  // success login
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
        refreshToken
      }
    }
  );

  const userResponse = {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar
  };

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: userResponse },"User logged in successfully")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $unset: { refreshToken: 1 } }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ReGenerate tokens
const refreshAccessToken = asyncHandler(async (req, res) => {
  // STEPS :-
  // Get Refresh Token from Client
  // Check Refresh Token Exists or Not
  // Verify Refresh Token
  // Extract User ID from Token
  // Check User Exists in Database
  // Match Refresh Token with Database
  // Generate New Tokens
  // Store Tokens in Secure Cookies
  // Send Success Response
  // Handle Errors
  
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jtw.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
  
    if(!user) {
      throw new ApiError(401, "Invalid RefreshToken");
    }
  
    if(incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
  
    const options = {
      httpOnly : true,
      secure : true
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
  
    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed")
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
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

const getCurrentUser = asyncHandler(async(req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"))
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
      select: "username fullName email avatar coverImage" 
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
      select: "username fullName email avatar coverImage" 
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
  registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword,
  getCurrentUser, changeUserDetails, updateAvatar, updateCoverImage , getUserChannelProfile, getWatchHistory
};
