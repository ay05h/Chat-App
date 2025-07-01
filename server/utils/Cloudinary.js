import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (img) => {
  try {
    if (!img) {
      console.log("File not Found!");
      return null;
    }
    const response = await cloudinary.uploader.upload(img, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

export { uploadToCloudinary };
