import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { updateMyProfile } from "../controllers/profileController.js";

const router = express.Router();

router.put("/me", requireAuth, updateMyProfile);

export default router;
