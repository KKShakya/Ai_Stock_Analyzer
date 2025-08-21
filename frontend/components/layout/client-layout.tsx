// components/layout/client-layout.tsx (enhanced version)
"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth';
import { useOnboardingStore } from '@/store/onboarding-store';
import AuthModal from "@/components/auth/auth-modal";
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { checkAuthStatus, isAuthenticated, user } = useAuthStore();
  const { isComplete, isVisible, toggleVisibility } = useOnboardingStore();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check auth status on app load
  useEffect(() => {
    const initializeApp = async () => {
      await checkAuthStatus();
      setIsInitialized(true);
    };
    
    initializeApp();
  }, [checkAuthStatus]);

  // Show onboarding for new authenticated users
  useEffect(() => {
    if (isInitialized && isAuthenticated && user && !isComplete && !isVisible) {
      const timer = setTimeout(() => {
        toggleVisibility();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isAuthenticated, user, isComplete, isVisible, toggleVisibility]);
  
  return (
    <>
      {children}
      
      {/* Global modals - only render after initialization */}
      {isInitialized && (
        <>
          <AuthModal />
          <OnboardingWizard />
        </>
      )}
    </>
  );
}
