import { Platform } from 'react-native';

// expo-notifications loaded lazily — not supported on web
let Notifications: typeof import('expo-notifications') | null = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  if (!Notifications) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHabitReminder(
  habitId: string,
  habitTitle: string,
  hour: number,
  minute: number,
) {
  if (Platform.OS === 'web') return; // web can't schedule future notifications without SW
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(habitId);
    await Notifications.scheduleNotificationAsync({
      identifier: habitId,
      content: {
        title: '⏰ Habit reminder',
        body: `Time to work on: ${habitTitle}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch {}
}

export async function cancelHabitReminder(habitId: string) {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(habitId);
  } catch {}
}

export async function cancelAllReminders() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
