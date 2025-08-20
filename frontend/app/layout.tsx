"use client";

import './globals.css'
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth';
import AuthModal from "@/components/auth/auth-modal";
import { GlobalErrorBoundary } from '@/components/error/global-error-boundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuthStatus } = useAuthStore();
  
  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundary>
        {children}
        {/* Auth modal available globally */}
        <AuthModal />
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
