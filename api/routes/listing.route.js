import express from "express";
import {
  createListing,
  uploadMultipleImagesController,
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

export default router;
