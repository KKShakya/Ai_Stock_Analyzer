// src/routes/auth.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  googleAuth, 
  googleCallback, 
  refreshToken, 
  getAuthStatus 
} from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middlewares/validation';

const router = Router();

// Traditional auth routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/status', getAuthStatus);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
