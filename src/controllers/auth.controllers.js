import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { checkUserLoginStatus, handleFailedLogin } from '../utils/security.login.js';
import { generateAccessAndRefreshToken, cookieOptions } from '../utils/token.js';
import jtw from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  if (![fullName, username, email, password].every(Boolean)) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    const user = await User.create({
      username: username.toLowerCase(),
      fullName,
      email,
      password
    });

    const userResponse = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email
    };

    return res.status(201).json(
      new ApiResponse(201, userResponse, "User registered successfully")
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Email or Username already exists");
    }
    throw error;
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  }).select("+password username loginAttempts lockUntil");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // account checks
  checkUserLoginStatus(user);

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    await handleFailedLogin(user);
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
        refreshToken,
      },
    }
  );

  const userResponse = {
    _id: user._id,
    username: user.username,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: userResponse }, "User logged in successfully")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.updateOne(
    { _id: req.user._id },
    { $unset: { refreshToken: 1 } },
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {username : req.user.username}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {  
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
  
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user);
  
    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {accessToken, refreshToken}, "Access token refreshed")
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

export {registerUser, loginUser, logoutUser, refreshAccessToken}
