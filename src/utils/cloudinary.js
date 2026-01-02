import cloudinary from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "users/avatar",
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    // console.log("Cloudinary Upload Success:", response.secure_url);
    console.log("Cloudinary Upload Success !");
    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export { uploadOnCloudinary };
