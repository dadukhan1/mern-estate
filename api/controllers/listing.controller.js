import Listing from "../models/listing.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleImagesController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.path)
    );

    const uploadedImages = await Promise.all(uploadPromises);

    const imageUrls = uploadedImages
      .filter((img) => img && img.secure_url)
      .map((img) => ({
        url: img.secure_url,
        public_id: img.public_id,
      }));

    if (imageUrls.length === 0) {
      return res.status(500).json({ message: "Upload failed" });
    }

    res.status(200).json({
      success: true,
      imageUrls,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
