import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitType } from '../types';
import { todayISO } from '../utils/date';

const STORAGE_KEY = '@habits_v2';

export interface AddHabitConfig {
  title: string;
  emoji: string;
  type: HabitType;
  targetCount: number;
  challengeDays?: number;
  reminderEnabled?: boolean;
  reminderHour?: number;
  reminderMinute?: number;
}

export interface HabitCompletionResult {
  justCompleted: boolean;
  challengeJustCompleted: boolean;
}

// NOTE: this is the raw state hook — do not call it directly in screens.
// Import useHabits from src/context/HabitsContext instead.
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setHabits(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  const persist = useCallback((next: Habit[]) => {
    setHabits(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addHabit = useCallback(
    (config: AddHabitConfig) => {
      const habit: Habit = {
        id: Date.now().toString(),
        title: config.title.trim(),
        emoji: config.emoji,
        type: config.type,
        targetCount: config.targetCount,
        completedDates: [],
        volumeLogs: [],
        challengeDays: config.challengeDays,
        challengeStartDate: config.challengeDays ? todayISO() : undefined,
        challengeCompleted: false,
        reminderEnabled: config.reminderEnabled ?? false,
        reminderHour: config.reminderHour,
        reminderMinute: config.reminderMinute,
        createdAt: new Date().toISOString(),
      };
      persist([...habits, habit]);
    },
    [habits, persist],
  );

  const toggleToday = useCallback(
    (id: string): HabitCompletionResult => {
      const today = todayISO();
      let justCompleted = false;
      let challengeJustCompleted = false;

      const next = habits.map((h) => {
        if (h.id !== id) return h;
        const wasCompleted = h.completedDates.includes(today);
        const newCompletedDates = wasCompleted
          ? h.completedDates.filter((d) => d !== today)
          : [...h.completedDates, today];

        justCompleted = !wasCompleted;

        let challengeCompleted = h.challengeCompleted ?? false;
        if (justCompleted && h.challengeDays && !challengeCompleted && h.challengeStartDate) {
          const streak = calcChallengeProgress(newCompletedDates, h.challengeStartDate, h.challengeDays);
          if (streak >= h.challengeDays) {
            challengeCompleted = true;
            challengeJustCompleted = true;
          }
        }

        return { ...h, completedDates: newCompletedDates, challengeCompleted };
      });

      persist(next);
      return { justCompleted, challengeJustCompleted };
    },
    [habits, persist],
  );

  const incrementVolume = useCallback(
    (id: string): HabitCompletionResult => {
      const today = todayISO();
      let justCompleted = false;
      let challengeJustCompleted = false;

      const next = habits.map((h) => {
        if (h.id !== id) return h;
        const existingLog = h.volumeLogs.find((l) => l.date === today);
        const prevCount = existingLog?.count ?? 0;
        const newCount = prevCount + 1;
        const newLogs = existingLog
          ? h.volumeLogs.map((l) => (l.date === today ? { ...l, count: newCount } : l))
          : [...h.volumeLogs, { date: today, count: newCount }];

        const reachedTarget = newCount >= h.targetCount;
        const wasAlreadyCompleted = h.completedDates.includes(today);
        const newCompletedDates =
          reachedTarget && !wasAlreadyCompleted
            ? [...h.completedDates, today]
            : h.completedDates;

        justCompleted = reachedTarget && !wasAlreadyCompleted;

        let challengeCompleted = h.challengeCompleted ?? false;
        if (justCompleted && h.challengeDays && !challengeCompleted && h.challengeStartDate) {
          const streak = calcChallengeProgress(newCompletedDates, h.challengeStartDate, h.challengeDays);
          if (streak >= h.challengeDays) {
            challengeCompleted = true;
            challengeJustCompleted = true;
          }
        }

        return { ...h, volumeLogs: newLogs, completedDates: newCompletedDates, challengeCompleted };
      });

      persist(next);
      return { justCompleted, challengeJustCompleted };
    },
    [habits, persist],
  );

  const decrementVolume = useCallback(
    (id: string) => {
      const today = todayISO();
      const next = habits.map((h) => {
        if (h.id !== id) return h;
        const existingLog = h.volumeLogs.find((l) => l.date === today);
        const prevCount = existingLog?.count ?? 0;
        if (prevCount === 0) return h;
        const newCount = prevCount - 1;
        const newLogs = h.volumeLogs.map((l) =>
          l.date === today ? { ...l, count: newCount } : l,
        );
        const newCompletedDates =
          newCount < h.targetCount
            ? h.completedDates.filter((d) => d !== today)
            : h.completedDates;
        return { ...h, volumeLogs: newLogs, completedDates: newCompletedDates };
      });
      persist(next);
    },
    [habits, persist],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      persist(habits.filter((h) => h.id !== id));
    },
    [habits, persist],
  );

  // Dev-only: fill in completedDates to simulate N consecutive days of a challenge
  const simulateChallengeDays = useCallback(
    (id: string, days: number) => {
      const next = habits.map((h) => {
        if (h.id !== id || !h.challengeStartDate) return h;
        const filled: string[] = [];
        for (let i = 0; i < days; i++) {
          const d = new Date(h.challengeStartDate + 'T00:00:00');
          d.setDate(d.getDate() + i);
          filled.push(d.toISOString().split('T')[0]);
        }
        const merged = Array.from(new Set([...h.completedDates, ...filled]));
        const challengeCompleted = (h.challengeDays ?? 0) > 0 && days >= (h.challengeDays ?? 0);
        return { ...h, completedDates: merged, challengeCompleted };
      });
      persist(next);
    },
    [habits, persist],
  );

  const resetAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    habits,
    loading,
    addHabit,
    toggleToday,
    incrementVolume,
    decrementVolume,
    deleteHabit,
    simulateChallengeDays,
    resetAll,
  };
}

export function calcStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = todayISO();
  let streak = 0;
  const cursor = new Date(today + 'T00:00:00');
  for (const d of sorted) {
    const iso = cursor.toISOString().split('T')[0];
    if (d === iso) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calcChallengeProgress(
  completedDates: string[],
  startDate: string,
  totalDays: number,
): number {
  let count = 0;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    if (completedDates.includes(iso)) count++;
  }
  return count;
}

export function getTodayVolume(habit: Habit): number {
  const today = todayISO();
  return habit.volumeLogs.find((l) => l.date === today)?.count ?? 0;
}
