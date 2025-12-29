import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});


const uploadOnCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "mern-estate",  // optional: folder in Cloudinary
        format: "auto",
        quality: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file);
  });
};

const deleteOnCloudinary = async (oldFilePath) => {
    try {
        // Deleting the old file
        await cloudinary.uploader.destroy(oldFilePath);
    } catch (error) {
        console.warn("⚠️ Cloudinary delete failed, skipping file:", error.message);
    }
}

export { uploadOnCloudinary, deleteOnCloudinary };