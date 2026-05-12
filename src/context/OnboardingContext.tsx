import React, { createContext, useContext } from 'react';
import { useOnboarding as useOnboardingImpl } from '../hooks/useOnboarding';

type OnboardingContextType = ReturnType<typeof useOnboardingImpl>;

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const value = useOnboardingImpl();
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextType {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
