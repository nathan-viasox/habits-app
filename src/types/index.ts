export type HabitType = 'binary' | 'volume';

export interface VolumeLog {
  date: string; // ISO date "YYYY-MM-DD"
  count: number;
}

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  type: HabitType;
  targetCount: number; // 1 for binary; N for volume
  completedDates: string[]; // dates where habit was fully completed
  volumeLogs: VolumeLog[]; // only meaningful for volume habits
  challengeDays?: number; // 3, 7, or 30
  challengeStartDate?: string; // ISO date
  challengeCompleted?: boolean;
  reminderEnabled?: boolean;
  reminderHour?: number; // 0-23
  reminderMinute?: number; // 0-59
  createdAt: string;
}
