// validations/onboarding.ts
import Joi from 'joi';

export const onboardingSchema = Joi.object({
  experience: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .empty('').empty(null) // This works for strings
    .default('beginner')
    .optional(),

  goals: Joi.array()
    .items(Joi.string().valid('trading', 'analysis', 'learning', 'portfolio'))
    .default(['analysis'])
    .optional(),

  interests: Joi.array()
    .items(Joi.string().valid('stocks', 'crypto', 'forex', 'commodities'))
    .default(['stocks']) 
    .optional(),

  riskTolerance: Joi.string()
    .valid('low', 'medium', 'high')
    .empty('').empty(null) 
    .default('medium')
    .optional(),

  notifications: Joi.boolean()
    .empty(null) 
    .default(true)
    .optional(),

  skipped: Joi.boolean()
    .default(false)
    .optional(),
});

export interface OnboardingData {
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: ('trading' | 'analysis' | 'learning' | 'portfolio')[];
  interests: ('stocks' | 'crypto' | 'forex' | 'commodities')[];
  riskTolerance: 'low' | 'medium' | 'high';
  notifications: boolean;
  skipped?: boolean;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  data?: OnboardingData;
  error?: string;
}
