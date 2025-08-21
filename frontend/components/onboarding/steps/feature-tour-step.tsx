// components/onboarding/steps/feature-tour-step.tsx
"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';

const features = [
  {
    id: 'ai-analysis',
    title: 'AI-Powered Analysis',
    description: 'Get intelligent insights and recommendations powered by advanced machine learning',
    icon: '🤖',
    preview: '/images/ai-analysis-preview.png',
    benefits: ['Real-time market analysis', 'Smart recommendations', 'Pattern recognition']
  },
  {
    id: 'real-time-data',
    title: 'Real-Time Market Data',
    description: 'Access live market data and track your favorite stocks in real-time',
    icon: '📊',
    preview: '/images/market-data-preview.png',
    benefits: ['Live price updates', 'Historical data', 'Market indicators']
  },
  {
    id: 'smart-alerts',
    title: 'Smart Alerts',
    description: 'Never miss important market movements with personalized notifications',
    icon: '🔔',
    preview: '/images/alerts-preview.png',
    benefits: ['Price alerts', 'Technical indicators', 'Custom conditions']
  },
  {
    id: 'portfolio-tracker',
    title: 'Portfolio Tracking',
    description: 'Monitor your investments and track performance with detailed analytics',
    icon: '📈',
    preview: '/images/portfolio-preview.png',
    benefits: ['Performance metrics', 'Risk analysis', 'Diversification insights']
  }
];

export function FeatureTourStep() {
  const [currentFeature, setCurrentFeature] = useState(0);

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const feature = features[currentFeature];

  return (
    <div className="space-y-6">
      {/* Feature Indicator Dots */}
      <div className="flex justify-center space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFeature(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentFeature
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Feature Content */}
      <motion.div
        key={currentFeature}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        {/* Feature Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="text-6xl mb-4"
        >
          {feature.icon}
        </motion.div>

        {/* Feature Title & Description */}
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold mb-3 text-gray-900 dark:text-white"
        >
          {feature.title}
        </motion.h3>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto"
        >
          {feature.description}
        </motion.p>

        {/* Feature Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-8 mb-6 mx-auto max-w-sm"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-4xl mb-2">{feature.icon}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {feature.title} Preview
            </div>
          </div>
        </motion.div>

        {/* Feature Benefits */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          {feature.benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{benefit}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={prevFeature}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Previous</span>
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentFeature + 1} of {features.length}
        </div>

        <button
          onClick={nextFeature}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span>Next</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
