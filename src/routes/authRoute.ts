import { Router } from 'express';
import { authenticate } from '@/middlewares/authenticate';
import { adminLogin, getMe, userLogin, userRegister, logout, refreshToken } from '@/controllers/authController';

const router = Router();

// ── USER: Local Auth ──────────────────────────────────────
router.post('/login', userLogin);
router.post('/register', userRegister);

// ── ADMIN: Email + Password ─────────────────────────────
router.post('/admin/login', adminLogin);

// ── SHARED ───────────────────────────────────────────────
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
