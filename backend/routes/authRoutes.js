import express from 'express';
import { login, refreshToken, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.get("/me", requireAuth, (req, res) => {
    res.json({user: req.user});
});

export default router;