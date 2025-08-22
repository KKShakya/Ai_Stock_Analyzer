// components/dashboard/dashboard-shell.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { useOnboardingStore } from "@/store/onboarding-store";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { user } = useAuthStore();
  const { userData, isComplete } = useOnboardingStore();

  return (
    <div className="space-y-2">
      {/* Personalization Banner - matching your SectionCard style */}
      {isComplete && userData?.interests && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">
                Dashboard personalized for {userData.experience} level trader
              </h3>
              <p className="text-sm text-muted-foreground">
                Focus: {userData.interests.join(", ")} • Risk: {userData.riskTolerance}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}
