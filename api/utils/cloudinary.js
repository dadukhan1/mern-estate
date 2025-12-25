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


const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
        console.warn("⚠️ File not found, skipping upload:", localFilePath);
        return null;
    }

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            public_id: `uploaded_${Date.now()}`,
            fetch_format: "auto",
            quality: "auto",
        });

        // Delete the local file after a successful upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.warn("⚠️ Cloudinary upload failed, skipping file:", error.message);
        // Delete the file even if the upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("🗑️ Local file deleted due to upload failure:", localFilePath);
        }
        return null;
    }
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