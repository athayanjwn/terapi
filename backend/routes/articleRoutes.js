import express from "express";
import {
  getAllArticles,
  getArticleById, 
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { requireArticleOwner } from "../middleware/ownershipMiddleware.js";

const router = express.Router();

/**
 * PUBLIC
 */
router.get("/", getAllArticles);
router.get("/:id", getArticleById);


/**
 * COUNSELOR ONLY
 */
router.post("/", requireAuth, requireRole(["konselor"]), createArticle);
router.put("/:id", requireAuth, requireRole(["konselor"]), requireArticleOwner, updateArticle);
router.delete("/:id", requireAuth, requireRole(["konselor"]), requireArticleOwner, deleteArticle);

export default router;
