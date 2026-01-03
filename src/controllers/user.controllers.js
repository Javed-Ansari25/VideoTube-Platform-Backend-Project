import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
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
  //   STEPS :-
  // Request se username, email, fullname, password lena
  // Check karna koi field empty to nahi
  // Database me check karna user already exist to nahi
  // Avatar & cover image ke local paths lena
  // Avatar compulsory hai – verify karna
  // Cloudinary pe files upload karna
  // Database me new user create karna
  // Password & sensitive fields hata kar user lana
  // Success response bhejna

  const { username, email, fullName, password } = req.body;

  if ([fullName, email, username, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All field are required');
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }], 
  });

  if (existedUser) {
    throw new ApiError(409, 'User already exists');
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  let coverImageLocalPath;

  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required ');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar upload failed');
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  //  STEPS :-
  //  Read data from request
  //  Validate required fields
  //  Search user in database
  //  Check if user exists
  //  Verify password
  //  Generate access & refresh tokens
  //  Remove sensitive fields from user data
  //  Set secure HTTP-only cookies(options)
  //  Send success response to client

  const {email, username, password} = req.body;

  if(!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  });

  if(!user) {
    throw new ApiError(404, "User does not exits");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly : true,
    secure : true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "user login successfully"
    ))
})

const logoutUser = asyncHandler(async (req, res) => {
    // STEPS :-
    // Database se refresh token hatao
    // Browser cookies clear karo
    // Success response bhejo

    await User.findByIdAndUpdate(
      req.user._id, // ye auth middleware se aa rha hai
      {
        $set: {
          refreshToken : undefined
        }
      },
      {
        new : true
      }
    )

    const options = {
      httpOnly : true,
      secure : true
    }

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully"));
})

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
      new ApiResponse(200, {accessToken, refreshAccessToken: newRefreshToken}, "Access token refreshed")
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };
