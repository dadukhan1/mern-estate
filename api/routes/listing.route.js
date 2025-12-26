import express from "express";
import {
  createListing,
  uploadMultipleImagesController,
  deleteListing,
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

export default router;
