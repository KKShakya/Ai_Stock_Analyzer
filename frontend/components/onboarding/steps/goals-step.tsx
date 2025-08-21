"use client";

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useState } from 'react';

const goals = [
  { id: 'trading', label: 'Day Trading', icon: '⚡', description: 'Quick trades and market timing' },
  { id: 'analysis', label: 'Stock Analysis', icon: '🔍', description: 'Deep research and due diligence' },
  { id: 'learning', label: 'Learning', icon: '📚', description: 'Understand markets and strategies' },
  { id: 'portfolio', label: 'Portfolio Management', icon: '📈', description: 'Long-term wealth building' },
];

export function GoalsStep() {
  const { userData, updateUserData } = useOnboardingStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userData.goals || []);

  const toggleGoal = (goalId: string) => {
    const updated = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    
    setSelectedGoals(updated);
    updateUserData({ goals: updated as any });
  };

  return (
    <div className="space-y-4">
      {goals.map((goal, index) => (
        <motion.div
          key={goal.id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => toggleGoal(goal.id)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedGoals.includes(goal.id)
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{goal.icon}</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {goal.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {goal.description}
              </p>
            </div>
            {selectedGoals.includes(goal.id) && (
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
  );
}
