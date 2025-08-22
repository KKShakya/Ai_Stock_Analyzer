// middleware/validateOnboarding.ts
import { Request, Response, NextFunction } from 'express';
import { onboardingSchema } from '../validations/onboarding';

export const validateOnboarding = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = onboardingSchema.validate(req.body, {
    abortEarly: false,    // Return all errors, not just the first one
    allowUnknown: false,  // Don't allow unknown fields
    stripUnknown: true,   // Remove unknown fields
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Invalid onboarding data provided',
      details: errorMessages,
    });
  }

  req.body = value;
  next();
};
