// components/auth/forgot-password-form.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, X, Send } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { closeAuthModal, switchToLogin } = useAuthStore();
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email || !validateEmail(email)) {
    setError("Please enter a valid email address");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (data.success) {
      setIsSubmitted(true);
    } else {
      throw new Error(data.error || 'Failed to send reset email');
    }
  } catch (error: any) {
    setError(error.message || "Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  const handleBackToLogin = () => {
    setIsSubmitted(false);
    setEmail("");
    setError("");
    switchToLogin();
  };

  if (isSubmitted) {
    // Success state
    return (
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Reset link sent successfully
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center">
            <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4 mb-8"
        >
          <p className="text-gray-700 dark:text-gray-300">
            We've sent a password reset link to:
          </p>
          <p className="font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl inline-block">
            {email}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleBackToLogin}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Back to Sign In
          </Button>
          
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Didn't receive the email?{" "}
            <button
              onClick={() => {
                setIsSubmitted(false);
                setError("");
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={switchToLogin}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forgot password?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              No worries, we'll send you reset instructions
            </p>
          </div>
        </div>
        <button
          onClick={closeAuthModal}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
              placeholder="Enter your email address"
              disabled={isLoading}
              required
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            We'll send a password reset link to this email
          </p>
        </div>

        {/* Submit Button */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending reset link...
              </div>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send reset link
              </>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Back to Login */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{" "}
          <button
            onClick={switchToLogin}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
