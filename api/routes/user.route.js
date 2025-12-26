import express from "express";
import { deleteUser, getUserListings, test, updateUser, uploadImageController } from "../controllers/user.controller.js";
import { upload } from "../utils/multer.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get('/test', test)
router.post("/upload", verifyToken, upload.single("image"), uploadImageController);
router.post('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/listings/:id', verifyToken, getUserListings);


export default router;