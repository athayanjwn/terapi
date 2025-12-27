import express from "express";
import {
  listPublishedAssessments,
  getAssessmentBySlug,
  submitAssessment,
  getMyAssessmentHistory,

  // Content manager
  createAssessment,
  updateAssessment,
  deleteAssessment,
  upsertAssessmentQuestions,
  upsertAssessmentRules,
  getAdminList,
  getAdminDetailById,
} from "../controllers/selfAssessmentController.js";
import { optionalAuth } from "./optionalAuthMiddleware.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/admin/list",
  requireAuth,
  requireRole("CONTENT_MANAGER_KONSELOR"),
  getAdminList
);

router.get(
  "/admin/:id",
  requireAuth,
  requireRole("CONTENT_MANAGER_KONSELOR"),
  getAdminDetailById
);

// AUTH USER (mahasiswa)
router.get("/me/history", requireAuth, requireRole("mahasiswa"), getMyAssessmentHistory);


// PUBLIC
router.get("/", listPublishedAssessments);
router.get("/:slug", getAssessmentBySlug);
router.post("/:slug/submit", optionalAuth, submitAssessment);


// CONTENT MANAGER KONSELOR
router.post("/", requireAuth, requireRole("CONTENT_MANAGER_KONSELOR"), createAssessment);
router.put("/:id", requireAuth, requireRole("CONTENT_MANAGER_KONSELOR"), updateAssessment);
router.delete("/:id", requireAuth, requireRole("CONTENT_MANAGER_KONSELOR"), deleteAssessment);

router.put("/:id/questions", requireAuth, requireRole("CONTENT_MANAGER_KONSELOR"), upsertAssessmentQuestions);
router.put("/:id/rules", requireAuth, requireRole("CONTENT_MANAGER_KONSELOR"), upsertAssessmentRules);

export default router;
