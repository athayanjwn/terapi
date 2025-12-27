import express from "express";
import {
  createAppointment,
  cancelAppointment,
  acceptAppointment,
  rejectAppointment,
  getJadwalPraktikKonselor,
  getBookedSlot,
  getAllKonselor,
  getMyAppointments
} from "../controllers/appointmentController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  getAllKonselor
);

router.get(
  "/my",
  requireAuth,
  getMyAppointments
);

router.get(
  "/konselor/:id",
  requireAuth,
  getJadwalPraktikKonselor
);

router.get(
  "/konselor/:id/tanggal",
  requireAuth,
  getBookedSlot
);

router.post("/", requireAuth, requireRole("mahasiswa"), createAppointment);
router.put("/:id/cancel", requireAuth, requireRole("mahasiswa"), cancelAppointment);

router.put("/:id/accept", requireAuth, requireRole("konselor"), acceptAppointment);
router.put("/:id/reject", requireAuth, requireRole("konselor"), rejectAppointment);




export default router;
