// components/onboarding/steps/preferences-step.tsx
"use client";

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useState } from 'react';

const experienceLevels = [
  { 
    id: 'beginner', 
    label: 'Beginner', 
    icon: '🌱', 
    description: 'New to stock analysis and investing' 
  },
  { 
    id: 'intermediate', 
    label: 'Intermediate', 
    icon: '📈', 
    description: 'Some experience with markets and analysis' 
  },
  { 
    id: 'advanced', 
    label: 'Advanced', 
    icon: '🚀', 
    description: 'Experienced trader with deep market knowledge' 
  },
];

const interests = [
  { id: 'stocks', label: 'Stocks', icon: '📊' },
  { id: 'crypto', label: 'Cryptocurrency', icon: '₿' },
  { id: 'forex', label: 'Forex', icon: '💱' },
  { id: 'commodities', label: 'Commodities', icon: '🥇' },
];

const riskLevels = [
  { 
    id: 'low', 
    label: 'Conservative', 
    icon: '🛡️', 
    description: 'Prefer stable, low-risk investments',
    color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
  },
  { 
    id: 'medium', 
    label: 'Moderate', 
    icon: '⚖️', 
    description: 'Balance between risk and reward',
    color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
  },
  { 
    id: 'high', 
    label: 'Aggressive', 
    icon: '🎯', 
    description: 'Comfortable with high-risk, high-reward',
    color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
  },
];

export function PreferencesStep() {
  const { userData, updateUserData } = useOnboardingStore();
  
  const [experience, setExperience] = useState<string>(userData.experience || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(userData.interests || []);
  const [riskTolerance, setRiskTolerance] = useState<string>(userData.riskTolerance || '');
  const [notifications, setNotifications] = useState<boolean>(userData.notifications ?? true);

  const handleExperienceChange = (level: string) => {
    setExperience(level);
    updateUserData({ experience: level as any });
  };

  const toggleInterest = (interestId: string) => {
    const updated = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    
    setSelectedInterests(updated);
    updateUserData({ interests: updated as any });
  };

  const handleRiskChange = (risk: string) => {
    setRiskTolerance(risk);
    updateUserData({ riskTolerance: risk as any });
  };

  const handleNotificationChange = (enabled: boolean) => {
    setNotifications(enabled);
    updateUserData({ notifications: enabled });
  };

  return (
    <div className="space-y-8">
      {/* Experience Level */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          What's your experience level?
        </h4>
        <div className="space-y-3">
          {experienceLevels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => handleExperienceChange(level.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                experience === level.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{level.icon}</div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {level.label}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {level.description}
                  </p>
                </div>
                {experience === level.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Market Interests */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          What markets interest you? (Select all that apply)
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {interests.map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              onClick={() => toggleInterest(interest.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                selectedInterests.includes(interest.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{interest.icon}</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {interest.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Risk Tolerance */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          What's your risk tolerance?
        </h4>
        <div className="space-y-3">
          {riskLevels.map((risk, index) => (
            <motion.div
              key={risk.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              onClick={() => handleRiskChange(risk.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                riskTolerance === risk.id
                  ? `${risk.color} border-current`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{risk.icon}</div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {risk.label}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {risk.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <div>
          <h5 className="font-medium text-gray-900 dark:text-white">
            Enable notifications
          </h5>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get alerts about market changes and analysis updates
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={notifications}
            onChange={(e) => handleNotificationChange(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </motion.div>
    </div>
  );
}
