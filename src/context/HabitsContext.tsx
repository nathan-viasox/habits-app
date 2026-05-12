import React, { createContext, useContext } from 'react';
import { useHabits as useHabitsImpl } from '../hooks/useHabits';

type HabitsContextType = ReturnType<typeof useHabitsImpl>;

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const value = useHabitsImpl();
  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextType {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
