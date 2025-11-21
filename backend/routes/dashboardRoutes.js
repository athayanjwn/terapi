import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get("/me", requireAuth, requireRole(["konselor", "mahasiswa"]), (req, res) => {
    res.json({ message: "Ini dashboard!"});
});

export default router;