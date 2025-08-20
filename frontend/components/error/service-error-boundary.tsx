// components/error/service-error-boundary.tsx
"use client";

import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Wifi, Zap } from 'lucide-react';

interface Props {
  children: ReactNode;
  serviceName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ServiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`${this.props.serviceName} service error:`, error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative min-h-[160px] flex items-center justify-center"
        >
          {/* Glassmorphism Card */}
          <div className="relative w-full backdrop-blur-xl bg-gradient-to-br from-red-50/80 via-orange-50/60 to-red-50/80 dark:from-red-950/80 dark:via-red-900/60 dark:to-red-950/80 rounded-3xl border border-red-200/50 dark:border-red-800/50 p-6 shadow-lg shadow-red-500/10">
            
            {/* Subtle background pattern */}
            <div className="absolute inset-0 rounded-3xl opacity-10">
              <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-red-400 to-orange-400 rounded-full blur-2xl" />
              <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full blur-xl" />
            </div>
            
            <div className="relative text-center space-y-4">
              
              {/* Service Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg shadow-red-500/20"
              >
                <AlertCircle className="h-6 w-6 text-white" />
              </motion.div>
              
              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="font-semibold text-red-900 dark:text-red-100 text-base">
                  {this.props.serviceName} Unavailable
                </h3>
                <p className="text-sm text-red-700/80 dark:text-red-300/80 leading-relaxed">
                  This service is temporarily down. Other features are still working normally.
                </p>
              </motion.div>
              
              {/* Retry Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  onClick={() => this.setState({ hasError: false })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-red-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-red-700/60 text-red-700 dark:text-red-200 font-medium rounded-2xl border border-red-200/60 dark:border-red-700/60 hover:border-red-300/80 dark:hover:border-red-600/80 shadow-sm hover:shadow-md transition-all duration-200"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="text-sm">Retry</span>
                  <Zap className="h-3 w-3 opacity-60" />
                </motion.button>
              </motion.div>
            </div>
            
            {/* Status indicator */}
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-4 left-4 flex items-center gap-1.5"
            >
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-xs text-red-600/70 dark:text-red-400/70 font-medium">
                Offline
              </span>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
