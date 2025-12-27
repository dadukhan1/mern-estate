import express from "express";
import {
  createListing,
  uploadMultipleImagesController,
  deleteListing,
  updateListing,
  getListing,
  getListings,
} from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { upload } from "../utils/multer.js";

const router = express.Router();

router.post(
  "/upload-images",
  verifyToken,
  upload.array("images", 6),
  uploadMultipleImagesController
);
router.post("/create", verifyToken, createListing);
router.delete("/delete/:id", verifyToken, deleteListing);
router.post("/update/:id", verifyToken, updateListing);
router.get("/getListing/:id", getListing);
router.get("/get", getListings);

export default router;
