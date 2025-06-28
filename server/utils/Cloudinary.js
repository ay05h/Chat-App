import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (img) => {
  try {
    if (!img) {
      confirm.log("File not Found!");
      return null;
    }
    const response = await cloudinary.uploader.upload(img, {
      resource_type: "auto",
    });
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadToCloudinary };
