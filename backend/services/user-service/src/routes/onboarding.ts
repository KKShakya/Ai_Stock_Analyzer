import { Router } from 'express';
import { saveOnboardingPreferences, getOnboardingStatus } from '../controllers/onboardingController'
import { authMiddleware } from '../middlewares/auth';
import { validateOnboarding } from '../middlewares/validateOnboarding';

const router = Router();

// POST /api/user/onboarding - Save onboarding preferences
router.post('/onboarding', 
  authMiddleware,          // Authenticate user first
  validateOnboarding,         // Validate with Joi
  saveOnboardingPreferences   // Handle request
);

// GET /api/user/onboarding - Get onboarding status
router.get('/onboarding', authMiddleware, getOnboardingStatus);

export default router;
