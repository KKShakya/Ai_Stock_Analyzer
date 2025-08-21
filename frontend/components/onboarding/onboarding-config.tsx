// components/onboarding/onboarding-config.tsx
import { WelcomeStep } from './steps/welcome-step';
import { GoalsStep } from './steps/goals-step';
import { PreferencesStep } from './steps/preferences-step';
import { FeatureTourStep } from './steps/feature-tour-step';
import { CompletionStep } from './steps/completion-step';

export const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to AI Stock Analyzer',
    description: 'Let\'s get you set up for success in just a few minutes',
    component: WelcomeStep,
  },
  {
    id: 'goals',
    title: 'What brings you here?',
    description: 'Help us personalize your experience',
    component: GoalsStep,
  },
  {
    id: 'preferences',
    title: 'Set your preferences',
    description: 'Configure your analysis and notification settings',
    component: PreferencesStep,
  },
  {
    id: 'tour',
    title: 'Quick feature tour',
    description: 'Discover the power of AI-driven analysis',
    component: FeatureTourStep,
  },
  {
    id: 'completion',
    title: 'You\'re all set!',
    description: 'Ready to start analyzing with AI',
    component: CompletionStep,
  },
];
