// app/auth/callback/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const newUser = searchParams.get('newUser');

      if (error) {
        console.error('OAuth error:', error);
        router.push('/?error=login_failed');
        return;
      }

      if (success === 'true' && token) {
        try {
          // Store the access token
          localStorage.setItem('accessToken', token);
          
          // Check auth status to update user state
          await checkAuthStatus();
          
          // Redirect based on user type
          if (newUser === 'true') {
            router.push('/onboarding'); // For new users
          } else {
            router.push('/dashboard'); // For returning users  
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=callback_failed');
        }
      } else {
        router.push('/?error=invalid_callback');
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuthStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Completing your login...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
}
