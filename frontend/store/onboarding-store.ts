// stores/onboarding-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  isOptional?: boolean;
}

export interface UserPreferences {
  experience: "beginner" | "intermediate" | "advanced";
  goals: ("trading" | "analysis" | "learning" | "portfolio")[];
  interests: ("stocks" | "crypto" | "forex" | "commodities")[];
  riskTolerance: "low" | "medium" | "high";
  notifications: boolean;
}

interface OnboardingState {
  // Progress tracking
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  isComplete: boolean;
  isLoading: boolean;
  error:string | null;

  // User data
  userData: Partial<UserPreferences>;

  // UI state
  isVisible: boolean;
  canSkip: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (stepId: string) => void;
  updateUserData: (data: Partial<UserPreferences>) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  toggleVisibility: () => void;
}

// Hybrid storage: localStorage + backend sync
const hybridStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);

    // TODO: Sync to backend when implemented
    // syncToBackend(name, JSON.parse(value));
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 0,
      totalSteps: 5,
      completedSteps: [],
      isComplete: false,
      userData: {},
      isVisible: false,
      canSkip: true,
      isLoading: false,
      error: null,


      // Actions
      setCurrentStep: (step: number) =>
        set({ currentStep: Math.max(0, Math.min(step, get().totalSteps - 1)) }),

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      completeStep: (stepId: string) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(stepId)) {
          set({ completedSteps: [...completedSteps, stepId] });
        }
      },

      updateUserData: (data: Partial<UserPreferences>) =>
        set((state) => ({
          userData: { ...state.userData, ...data },
        })),

      completeOnboarding: async () => {
        const { userData } = get();

        set({ isLoading: true, error: null });

        try {
          const token = localStorage.getItem("accessToken");

          if (!token) {
            throw new Error("Authentication required");
          }

          // Save to backend
          const response = await fetch(`${API_BASE_URL}/api/v1/user/onboarding`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to save onboarding data"
            );
          }

          const result = await response.json();

          if (result.success) {
            set({
              isComplete: true,
              isVisible: false,
              isLoading: false,
              error: null,
            });

            console.log("Onboarding completed and saved:", result.data);
          } else {
            throw new Error(result.error || "Failed to save onboarding");
          }
        } catch (error) {
          console.error("Failed to save onboarding:", error);

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to save preferences",
            isLoading: false,
          });

          // Still mark as complete locally for better UX
          set({
            isComplete: true,
            isVisible: false,
          });
        }
      },

      resetOnboarding: () =>
        set({
          currentStep: 0,
          completedSteps: [],
          isComplete: false,
          userData: {},
          isVisible: true,
        }),

      toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
    }),
    {
      name: "ai-stock-onboarding",
      storage: createJSONStorage(() => hybridStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        isComplete: state.isComplete,
        userData: state.userData,
      }),
    }
  )
);
