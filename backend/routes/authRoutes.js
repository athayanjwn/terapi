import express from 'express';
import { login, refreshToken, logout, register, resendVerification } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';


const router = express.Router();


router.post("/register", register);
router.post("/resend-verification", resendVerification);

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.get("/me", requireAuth, (req, res) => {
    res.json({user: req.user, profile: req.profile});
});

export default router;