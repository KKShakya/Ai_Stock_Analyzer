// components/onboarding/steps/completion-step.tsx
"use client";

import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { useAuthStore } from '@/hooks/use-auth';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const quickActions = [
  {
    id: 'create-watchlist',
    title: 'Create Your First Watchlist',
    description: 'Track your favorite stocks',
    icon: '📋',
    action: 'watchlist',
    color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
  },
  {
    id: 'ask-ai',
    title: 'Ask AI a Question',
    description: 'Get insights about any stock',
    icon: '🤖',
    action: 'ai-chat',
    color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300'
  },
  {
    id: 'explore-market',
    title: 'Explore Market Data',
    description: 'Browse trending stocks',
    icon: '📊',
    action: 'market',
    color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
  }
];

const tips = [
  '💡 Pro tip: Use keyboard shortcuts (Ctrl+K) to quickly search stocks',
  '🎯 Set price alerts to stay informed about market movements',
  '📱 Access your dashboard from any device - your data syncs automatically',
  '🔔 Enable notifications to never miss important market updates'
];

export function CompletionStep() {
  const { userData } = useOnboardingStore();
  const { user } = useAuthStore();

  // Trigger confetti animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleQuickAction = (action: string) => {
    // Handle navigation to different features
    console.log('Quick action:', action);
    // This will be implemented when you add routing
    // router.push(`/${action}`);
  };

  const getPersonalizedMessage = () => {
    const goals = userData.goals || [];
    if (goals.includes('trading')) {
      return "You're all set for active trading! 📈";
    } else if (goals.includes('learning')) {
      return "Ready to learn and grow your knowledge! 📚";
    } else if (goals.includes('portfolio')) {
      return "Time to build and track your portfolio! 💼";
    }
    return "You're ready to start your investment journey! 🚀";
  };

  return (
    <div className="text-center space-y-8">
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="relative"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="text-4xl text-white"
          >
            🎉
          </motion.div>
        </div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [0, (i % 2 ? 100 : -100)],
              y: [0, (i % 3 ? -80 : -120)],
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        ))}
      </motion.div>

      {/* Completion Message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome aboard, {user?.name?.split(' ')[0]}! 🎊
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          {getPersonalizedMessage()}
        </p>
        <p className="text-gray-500 dark:text-gray-500">
          Your account is now configured and ready to use.
        </p>
      </motion.div>

      {/* User Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Your Setup Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-left">
            <span className="text-gray-600 dark:text-gray-400">Experience:</span>
            <div className="font-medium capitalize text-gray-900 dark:text-white">
              {userData.experience || 'Not specified'}
            </div>
          </div>
          <div className="text-left">
            <span className="text-gray-600 dark:text-gray-400">Risk Tolerance:</span>
            <div className="font-medium capitalize text-gray-900 dark:text-white">
              {userData.riskTolerance || 'Not specified'}
            </div>
          </div>
          <div className="text-left col-span-2">
            <span className="text-gray-600 dark:text-gray-400">Interests:</span>
            <div className="font-medium text-gray-900 dark:text-white">
              {userData.interests?.join(', ') || 'None selected'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          What would you like to do first?
        </h4>
        <div className="grid gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              onClick={() => handleQuickAction(action.action)}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${action.color}`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{action.icon}</div>
                <div className="text-left">
                  <h5 className="font-medium">{action.title}</h5>
                  <p className="text-sm opacity-75">{action.description}</p>
                </div>
                <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
      >
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Pro Tips to Get Started
        </h4>
        <div className="space-y-2 text-left">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              {tip}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Success Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.3, type: 'spring' }}
        className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium"
      >
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Onboarding Complete!
      </motion.div>
    </div>
  );
}
