"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { OnboardingStep } from './onboarding-step';
import { OnboardingProgress } from './onboarding-progress';
import { onboardingSteps } from './onboarding-config';


export function OnboardingWizard() {
  const { 
    currentStep, 
    isVisible, 
    isComplete,
    toggleVisibility,
    completeOnboarding
  } = useOnboardingStore();

  if (isComplete || !isVisible) {
    return null;
  }
  
  const handleSkipNow = async() => {
    toggleVisibility();
    completeOnboarding();
  }


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          <OnboardingProgress />
          
          {/* FIX: Add stable key and mode */}
          <div className="relative overflow-y-auto h-[calc(100vh-200px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${currentStep}`} // Stable key
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <OnboardingStep 
                  step={onboardingSteps[currentStep]} 
                  stepIndex={currentStep}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleSkipNow}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          Skip for now
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

