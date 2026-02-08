import { ApiError } from "./ApiError.js";
import { User } from "../models/user.model.js";

export const generateAccessAndRefreshToken = async (user) => {
  try {
    // const user = await User.findById(user);
    const accessToken = user.accessTokenGenerate();
    const refreshToken = user.refreshTokenGenerate();    

    user.refreshToken = refreshToken;
    await user.save({ValidateBeforeSave: false});

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(401, "Some thing went wrong, Access and Refresh token generate");
  }
}


export const cookieOptions = {
    httpOnly: true,
    secure: true,         
    sameSite: "strict"
}