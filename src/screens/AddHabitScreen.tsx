import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../context/HabitsContext';
import { scheduleHabitReminder, requestNotificationPermissions } from '../utils/notifications';
import type { HabitType } from '../types';

// 23 emojis — displayed as a 2-row flexWrap grid
const EMOJIS = [
  '🏃', '📚', '💧', '🧘', '💪', '🥗', '😴', '✍️',
  '🎯', '🎸', '🌿', '🧠', '🎨', '🏋️', '🚴', '🧗',
  '🎵', '🏊', '🌅', '🍎', '☕', '🧩', '🫁',
];

const CHALLENGE_OPTIONS = [
  { days: 0, label: 'No challenge' },
  { days: 3, label: '3 days 🎯' },
  { days: 7, label: '7 days 🔥' },
  { days: 30, label: '30 days 🏆' },
] as const;

const REMINDER_TIMES = [
  { label: '7 AM',  hour: 7,  minute: 0 },
  { label: '8 AM',  hour: 8,  minute: 0 },
  { label: '9 AM',  hour: 9,  minute: 0 },
  { label: '12 PM', hour: 12, minute: 0 },
  { label: '6 PM',  hour: 18, minute: 0 },
  { label: '8 PM',  hour: 20, minute: 0 },
  { label: '9 PM',  hour: 21, minute: 0 },
];

export function AddHabitScreen() {
  const navigation = useNavigation();
  const { addHabit } = useHabits();

  const [title, setTitle]               = useState('');
  const [emoji, setEmoji]               = useState('🎯');
  const [type, setType]                 = useState<HabitType>('binary');
  const [targetCount, setTargetCount]   = useState(3);
  const [challengeDays, setChallengeDays] = useState<0 | 3 | 7 | 30>(0);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTimeIndex, setReminderTimeIndex] = useState(1); // 8 AM default
  const [reminderConfirmed, setReminderConfirmed] = useState(false);
  const [saving, setSaving]             = useState(false);

  const canSave = title.trim().length > 0;
  const selectedTime = REMINDER_TIMES[reminderTimeIndex];

  async function handleToggleReminder(value: boolean) {
    if (value && Platform.OS !== 'web') {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
    }
    setReminderEnabled(value);
    setReminderConfirmed(false);
  }

  function handlePickTime(index: number) {
    setReminderTimeIndex(index);
    setReminderConfirmed(true); // selecting a time confirms the reminder
  }

  async function handleSave() {
    if (!canSave || saving) return;
    setSaving(true);
    const time = REMINDER_TIMES[reminderTimeIndex];
    addHabit({
      title: title.trim(),
      emoji,
      type,
      targetCount: type === 'volume' ? targetCount : 1,
      challengeDays: challengeDays > 0 ? challengeDays : undefined,
      reminderEnabled,
      reminderHour:   reminderEnabled ? time.hour   : undefined,
      reminderMinute: reminderEnabled ? time.minute : undefined,
    });
    if (reminderEnabled && Platform.OS !== 'web') {
      await scheduleHabitReminder(Date.now().toString(), title.trim(), time.hour, time.minute);
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Habit</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={!canSave || saving}>
            <Text style={[styles.saveText, (!canSave || saving) && styles.saveTextDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {/* ── Icon ── */}
          <Text style={styles.label}>Icon</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiOption, emoji === e && styles.emojiSelected]}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Name ── */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning run, Meditate…"
            placeholderTextColor="#AEAEB2"
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
            autoFocus
          />

          {/* ── Type ── */}
          <Text style={styles.label}>Habit type</Text>
          <View style={styles.segmentRow}>
            {([
              { value: 'binary', emoji: '✅', label: 'Daily',  hint: 'Once per day' },
              { value: 'volume', emoji: '🔢', label: 'Volume', hint: 'Track a count' },
            ] as const).map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.segment, type === t.value && styles.segmentActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={styles.segmentEmoji}>{t.emoji}</Text>
                <Text style={[styles.segmentLabel, type === t.value && styles.segmentLabelActive]}>{t.label}</Text>
                <Text style={styles.segmentHint}>{t.hint}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {type === 'volume' && (
            <>
              <Text style={styles.label}>Daily target</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setTargetCount((v) => Math.max(1, v - 1))}>
                  <Text style={styles.counterBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{targetCount}× per day</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setTargetCount((v) => v + 1)}>
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Challenge ── */}
          <Text style={styles.label}>Challenge (optional)</Text>
          <View style={styles.chipRow}>
            {CHALLENGE_OPTIONS.map(({ days, label }) => (
              <TouchableOpacity
                key={days}
                style={[styles.chip, challengeDays === days && styles.chipActive]}
                onPress={() => setChallengeDays(days as any)}
              >
                <Text style={[styles.chipLabel, challengeDays === days && styles.chipLabelActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Daily reminder ── */}
          <Text style={styles.label}>Daily reminder</Text>
          <View style={styles.card}>
            <View style={styles.reminderToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderTitle}>Enable reminder</Text>
                <Text style={styles.reminderSub}>
                  {reminderEnabled
                    ? `Will remind you at ${selectedTime.label} each day`
                    : 'Get nudged at a set time each day'}
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#fff"
              />
            </View>

            {reminderEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.timeBlock}>
                  <Text style={styles.timeBlockLabel}>Pick a time</Text>
                  <View style={styles.timeGrid}>
                    {REMINDER_TIMES.map((t, i) => (
                      <TouchableOpacity
                        key={t.label}
                        style={[styles.timeChip, reminderTimeIndex === i && styles.timeChipActive]}
                        onPress={() => handlePickTime(i)}
                      >
                        <Text style={[styles.timeChipText, reminderTimeIndex === i && styles.timeChipTextActive]}>
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Confirmation banner */}
                <View style={styles.reminderConfirm}>
                  <Text style={styles.reminderConfirmText}>
                    🔔 Reminder set for {selectedTime.label} daily
                    {Platform.OS === 'web' ? ' (push requires native app)' : ''}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  cancelBtn: { minWidth: 60 },
  cancelText: { fontSize: 16, color: '#8E8E93' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  saveBtn: { minWidth: 60, alignItems: 'flex-end' },
  saveText: { fontSize: 16, fontWeight: '700', color: '#007AFF' },
  saveTextDisabled: { color: '#C7C7CC' },
  body: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 24,
  },
  // Emoji grid — flexWrap so it forms 2+ rows naturally
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: { borderColor: '#007AFF', backgroundColor: '#EBF3FF' },
  emojiText: { fontSize: 26 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  segmentRow: { flexDirection: 'row', gap: 12 },
  segment: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  segmentActive: { borderColor: '#007AFF', backgroundColor: '#EBF3FF' },
  segmentEmoji: { fontSize: 26, marginBottom: 6 },
  segmentLabel: { fontSize: 14, fontWeight: '700', color: '#3A3A3C', marginBottom: 2 },
  segmentLabelActive: { color: '#007AFF' },
  segmentHint: { fontSize: 11, color: '#8E8E93', textAlign: 'center' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center',
  },
  counterBtnText: { fontSize: 22, fontWeight: '600', color: '#3A3A3C' },
  counterValue: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#E5E5EA',
  },
  chipActive: { borderColor: '#007AFF', backgroundColor: '#EBF3FF' },
  chipLabel: { fontSize: 14, fontWeight: '600', color: '#3A3A3C' },
  chipLabelActive: { color: '#007AFF' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  reminderToggleRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  reminderTitle: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
  reminderSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginHorizontal: 14 },
  timeBlock: { padding: 14 },
  timeBlockLabel: { fontSize: 13, fontWeight: '500', color: '#3A3A3C', marginBottom: 10 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, backgroundColor: '#F2F2F7',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  timeChipActive: { borderColor: '#007AFF', backgroundColor: '#EBF3FF' },
  timeChipText: { fontSize: 13, fontWeight: '500', color: '#3A3A3C' },
  timeChipTextActive: { color: '#007AFF', fontWeight: '700' },
  reminderConfirm: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reminderConfirmText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
