// components/onboarding/onboarding-step.tsx
"use client";

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Button } from '@/components/ui/button';

interface StepConfig {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
}

interface OnboardingStepProps {
  step: StepConfig;
  stepIndex: number;
}

export function OnboardingStep({ step, stepIndex }: OnboardingStepProps) {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    previousStep, 
    completeStep,
    completeOnboarding 
  } = useOnboardingStore();

  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    completeStep(step.id);
    
    if (isLastStep) {
      await completeOnboarding();
    } else {
      nextStep();
    }
  };

  const StepComponent = step.component;

  return (
    <div className="p-6">
      {/* Step Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {step.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {step.description}
        </p>
      </motion.div>

      {/* Step Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <StepComponent />
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center"
      >
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={isFirstStep}
          className="min-w-24 rounded-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={nextStep}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 rounded-lg"
          >
            Skip
          </Button>
          
          <Button
            onClick={handleNext}
            className="min-w-24 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg"
          >
            {isLastStep ? 'Get Started' : 'Continue'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
