import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHabits } from '../context/HabitsContext';
import { useOnboarding } from '../context/OnboardingContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { cancelAllReminders, requestNotificationPermissions } from '../utils/notifications';
import { triggerChallengeHaptic, playChallengeChime } from '../utils/reward';
import { calcChallengeProgress } from '../hooks/useHabits';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const REMINDER_TIMES = [
  { label: '7 AM', hour: 7, minute: 0 },
  { label: '8 AM', hour: 8, minute: 0 },
  { label: '9 AM', hour: 9, minute: 0 },
  { label: '12 PM', hour: 12, minute: 0 },
  { label: '6 PM', hour: 18, minute: 0 },
  { label: '8 PM', hour: 20, minute: 0 },
  { label: '9 PM', hour: 21, minute: 0 },
];

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { habits, resetAll, simulateChallengeDays } = useHabits();
  const { resetOnboarding } = useOnboarding();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedTime, setSelectedTime] = useState(1);
  const [reminderConfirmed, setReminderConfirmed] = useState(false);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [onboardingConfirmVisible, setOnboardingConfirmVisible] = useState(false);

  async function handleToggleNotifications(value: boolean) {
    if (value && Platform.OS !== 'web') {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
    }
    setNotificationsEnabled(value);
    setReminderConfirmed(false);
    if (!value) await cancelAllReminders();
  }

  function handlePickTime(index: number) {
    setSelectedTime(index);
    setReminderConfirmed(true);
  }

  const habitsWithActiveChallenge = habits.filter(
    (h) => h.challengeDays && h.challengeStartDate && !h.challengeCompleted,
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Settings</Text>

        {/* App info */}
        <Text style={styles.sectionLabel}>Help</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('HowItWorks')}
          >
            <Text style={styles.rowTitle}>How it works</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>Reminders</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Daily reminders</Text>
              <Text style={styles.rowSub}>
                {notificationsEnabled
                  ? `Set for ${REMINDER_TIMES[selectedTime].label} daily`
                  : 'Get nudged to check in with your habits'}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#fff"
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.divider} />
              <View style={styles.timeBlock}>
                <Text style={styles.timeBlockLabel}>Default reminder time</Text>
                <View style={styles.timeGrid}>
                  {REMINDER_TIMES.map((t, i) => (
                    <TouchableOpacity
                      key={t.label}
                      style={[styles.timeOption, selectedTime === i && styles.timeOptionActive]}
                      onPress={() => handlePickTime(i)}
                    >
                      <Text style={[styles.timeOptionText, selectedTime === i && styles.timeOptionTextActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {reminderConfirmed && (
                <View style={styles.reminderConfirm}>
                  <Text style={styles.reminderConfirmText}>
                    🔔 Reminders set for {REMINDER_TIMES[selectedTime].label} daily
                    {Platform.OS === 'web' ? ' (push requires native app)' : ''}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Habits summary */}
        <Text style={styles.sectionLabel}>Your habits</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Active habits</Text>
            <Text style={styles.rowValue}>{habits.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Active challenges</Text>
            <Text style={styles.rowValue}>{habitsWithActiveChallenge.length}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Challenges completed</Text>
            <Text style={styles.rowValue}>{habits.filter((h) => h.challengeCompleted).length}</Text>
          </View>
        </View>

        {/* Developer tools */}
        <Text style={styles.sectionLabel}>Developer Tools 🛠</Text>
        <View style={styles.card}>
          {habitsWithActiveChallenge.length === 0 ? (
            <View style={styles.row}>
              <Text style={styles.rowSub}>
                No active challenges. Add a habit with a challenge to test completion rewards.
              </Text>
            </View>
          ) : (
            habitsWithActiveChallenge.map((habit, index) => {
              const progress = calcChallengeProgress(
                habit.completedDates,
                habit.challengeStartDate!,
                habit.challengeDays!,
              );
              return (
                <React.Fragment key={habit.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <View style={styles.devRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {habit.emoji} {habit.title}
                      </Text>
                      <Text style={styles.rowSub}>
                        Progress: {progress} / {habit.challengeDays} days
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.devBtn}
                      onPress={() => {
                        simulateChallengeDays(habit.id, habit.challengeDays!);
                        triggerChallengeHaptic();
                        playChallengeChime();
                      }}
                    >
                      <Text style={styles.devBtnText}>Simulate complete</Text>
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              );
            })
          )}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowSub}>
              Tip: After simulating, check the Today tab — completed challenges show the 🏆 badge.
            </Text>
          </View>
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setOnboardingConfirmVisible(true)}>
            <Text style={styles.rowTitle}>Replay onboarding</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => setResetConfirmVisible(true)}>
            <Text style={[styles.rowTitle, styles.danger]}>Reset all data</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Habit Tracker · React Native + Expo</Text>
      </ScrollView>

      <ConfirmModal
        visible={resetConfirmVisible}
        title="Reset all data"
        message="This permanently deletes all habits and history. Cannot be undone."
        confirmLabel="Reset everything"
        destructive
        onConfirm={async () => {
          setResetConfirmVisible(false);
          await cancelAllReminders();
          resetAll();
        }}
        onCancel={() => setResetConfirmVisible(false)}
      />

      <ConfirmModal
        visible={onboardingConfirmVisible}
        title="Replay onboarding"
        message="This will show the welcome flow again on next launch."
        confirmLabel="Reset"
        onConfirm={() => {
          setOnboardingConfirmVisible(false);
          resetOnboarding();
        }}
        onCancel={() => setOnboardingConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 34, fontWeight: '800', color: '#1C1C1E', marginBottom: 24, marginTop: 4 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rowTitle: { fontSize: 16, fontWeight: '500', color: '#1C1C1E', flex: 1 },
  rowSub: { fontSize: 13, color: '#8E8E93', marginTop: 2, flex: 1 },
  rowValue: { fontSize: 16, fontWeight: '600', color: '#8E8E93' },
  rowChevron: { fontSize: 20, color: '#C7C7CC' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginHorizontal: 16 },
  timeBlock: { paddingHorizontal: 16, paddingVertical: 14 },
  timeBlockLabel: { fontSize: 14, fontWeight: '500', color: '#3A3A3C', marginBottom: 10 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  timeOptionActive: { borderColor: '#007AFF', backgroundColor: '#EBF3FF' },
  timeOptionText: { fontSize: 13, fontWeight: '500', color: '#3A3A3C' },
  timeOptionTextActive: { color: '#007AFF', fontWeight: '700' },
  devBtn: {
    backgroundColor: '#EBF3FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  devBtnText: { fontSize: 13, fontWeight: '600', color: '#007AFF' },
  danger: { color: '#FF3B30' },
  footer: { textAlign: 'center', fontSize: 12, color: '#C7C7CC', marginTop: 8 },
  reminderConfirm: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reminderConfirmText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
