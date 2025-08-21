// components/onboarding/onboarding-progress.tsx
"use client";

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';

export function OnboardingProgress() {
  const { currentStep, totalSteps } = useOnboardingStore();
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      {/* Step indicators */}
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}
            animate={{
              scale: i === currentStep ? 1.1 : 1,
              backgroundColor: i <= currentStep ? '#3b82f6' : '#e5e7eb',
            }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {i < currentStep ? (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </motion.svg>
            ) : (
              i + 1
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        />
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}
