import Listing from "../models/listing.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { errorHandler } from "../utils/error.js";

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
      uploadOnCloudinary(file.buffer)
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

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found!"));

    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, "You can only delete your own listings!"));
    }
    // ---- Delete Images from Cloudinary ----
    await Promise.all(
      listing.imageUrls.map(async (img) => {
        await deleteOnCloudinary(img.public_id);
      })
    );
    // ---- Delete Listing from DB ----
    await listing.deleteOne();

    return res.status(200).json("Listing and all images deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    // 1) Load listing
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    // 2) Check ownership (ensure types match by stringifying)
    if (String(listing.userRef) !== req.user.id) {
      return next(errorHandler(401, "You can only update your own listings!"));
    }

    // 3) Prepare lists of public_ids
    const existingImages = Array.isArray(listing.imageUrls)
      ? listing.imageUrls
      : [];
    const incomingImages = Array.isArray(req.body.imageUrls)
      ? req.body.imageUrls
      : [];

    // existingPublicIds: public_id values stored in DB (if present)
    const existingPublicIds = existingImages
      .map((img) => img && img.public_id)
      .filter(Boolean);

    // incomingPublicIds: public_id values sent by client (if any)
    const incomingPublicIds = incomingImages
      .map((img) => (img && typeof img === "object" ? img.public_id : null))
      .filter(Boolean);

    // 4) Determine which images were removed on the client
    const toDelete = existingPublicIds.filter(
      (id) => !incomingPublicIds.includes(id)
    );

    // 5) Delete removed images from Cloudinary (log but don't fail whole request)
    await Promise.all(
      toDelete.map(async (public_id) => {
        try {
          await deleteOnCloudinary(public_id);
        } catch (err) {
          console.error("Failed to delete from Cloudinary:", public_id, err);
        }
      })
    );

    // 6) Update listing with new body (expects imageUrls to contain stored objects for saved images)
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(401, "Listing not found!"));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [true, false] };
    }

    let parking = req.query.parking;
    if (parking === undefined || parking === "false") {
      parking = { $in: [true, false] };
    }

    let type = req.query.type;

    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";

    const order = req.query.order || "desc";

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
