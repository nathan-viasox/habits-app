import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../context/OnboardingContext';
import { useHabits } from '../context/HabitsContext';

const EMOJIS = ['🏃', '📚', '💧', '🧘', '💪', '🥗', '😴', '✍️', '🎯', '🎸'];

// ─── Step 0: Welcome ────────────────────────────────────────────────────────
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={step.container}>
      <Text style={step.bigEmoji}>🌱</Text>
      <Text style={step.heroTitle}>Build habits that stick</Text>
      <Text style={step.heroSubtitle}>
        Track daily habits, hit personal challenges, and celebrate every win — big and small.
      </Text>
      <View style={step.featureList}>
        {[
          { emoji: '✅', text: 'Check off habits each day' },
          { emoji: '🔥', text: 'Build streaks with consecutive days' },
          { emoji: '🏆', text: 'Complete challenges and earn rewards' },
          { emoji: '🔔', text: 'Get daily reminders at the time you choose' },
        ].map((f) => (
          <View key={f.text} style={step.featureRow}>
            <Text style={step.featureEmoji}>{f.emoji}</Text>
            <Text style={step.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={step.primaryBtn} onPress={onNext} activeOpacity={0.85}>
        <Text style={step.primaryBtnText}>Get started →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 1: Create first habit ─────────────────────────────────────────────
function CreateHabitStep({ onFinish }: { onFinish: (config: HabitConfig) => void }) {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [type, setType] = useState<'binary' | 'volume'>('binary');
  const [volumeTarget, setVolumeTarget] = useState(3);
  const [challengeDays, setChallengeDays] = useState<0 | 3>(3);
  const [submitting, setSubmitting] = useState(false);

  function handleFinish() {
    if (submitting) return;
    setSubmitting(true);
    onFinish({
      title: title.trim() || 'My first habit',
      emoji,
      type,
      targetCount: type === 'volume' ? volumeTarget : 1,
      challengeDays: challengeDays > 0 ? challengeDays : undefined,
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={step.formScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={step.slideTitle}>Create your first habit</Text>
        <Text style={step.slideSub}>You can add more later from the Today screen.</Text>

        {/* Emoji */}
        <Text style={step.label}>Choose an icon</Text>
        <View style={step.emojiGrid}>
          {EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[step.emojiOption, emoji === e && step.emojiSelected]}
              onPress={() => setEmoji(e)}
            >
              <Text style={step.emojiOptionText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <Text style={step.label}>Habit name</Text>
        <TextInput
          style={step.input}
          placeholder="e.g. Morning run, Read 30 min…"
          placeholderTextColor="#AEAEB2"
          value={title}
          onChangeText={setTitle}
          returnKeyType="done"
          autoFocus={false}
        />

        {/* Type */}
        <Text style={step.label}>Type</Text>
        <View style={step.segmentRow}>
          {([
            { value: 'binary', label: 'Daily (once)', hint: 'Tap once to mark done' },
            { value: 'volume', label: 'Volume (multiple)', hint: 'Track a count per day' },
          ] as const).map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[step.segment, type === t.value && step.segmentActive]}
              onPress={() => setType(t.value)}
            >
              <Text style={[step.segmentText, type === t.value && step.segmentTextActive]}>
                {t.label}
              </Text>
              <Text style={step.segmentHint}>{t.hint}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === 'volume' && (
          <>
            <Text style={step.label}>Daily target</Text>
            <View style={step.counterRow}>
              <TouchableOpacity
                style={step.counterBtn}
                onPress={() => setVolumeTarget((v) => Math.max(1, v - 1))}
              >
                <Text style={step.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={step.counterValue}>{volumeTarget}× per day</Text>
              <TouchableOpacity
                style={step.counterBtn}
                onPress={() => setVolumeTarget((v) => v + 1)}
              >
                <Text style={step.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Challenge */}
        <Text style={step.label}>Start a 3-day challenge?</Text>
        <Text style={[step.slideSub, { marginTop: -4, marginBottom: 10 }]}>
          Hit this habit 3 days in a row and earn a reward.
        </Text>
        <View style={step.segmentRow}>
          {([
            { value: 3, label: '🎯 Yes, start it!' },
            { value: 0, label: 'Not yet' },
          ] as const).map((d) => (
            <TouchableOpacity
              key={d.value}
              style={[step.segment, challengeDays === d.value && step.segmentActive]}
              onPress={() => setChallengeDays(d.value as 0 | 3)}
            >
              <Text style={[step.segmentText, challengeDays === d.value && step.segmentTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[step.primaryBtn, { marginTop: 28 }, submitting && step.primaryBtnDisabled]}
          onPress={handleFinish}
          activeOpacity={0.85}
          disabled={submitting}
        >
          <Text style={step.primaryBtnText}>Let's go! 🚀</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface HabitConfig {
  title: string;
  emoji: string;
  type: 'binary' | 'volume';
  targetCount: number;
  challengeDays?: number;
}

// ─── Main component ──────────────────────────────────────────────────────────
export function OnboardingScreen() {
  const { completeOnboarding } = useOnboarding();
  const { addHabit } = useHabits();
  const [step, setStep] = useState(0);

  function handleFinish(config: HabitConfig) {
    addHabit(config);
    completeOnboarding();
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
        ))}
      </View>

      {step === 0 ? (
        <WelcomeStep onNext={() => setStep(1)} />
      ) : (
        <CreateHabitStep onFinish={handleFinish} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 4,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C7C7CC',
  },
  dotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
});

const step = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  featureList: {
    alignSelf: 'stretch',
    gap: 14,
    marginBottom: 36,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#3C3C43',
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#C7C7CC',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  formScroll: {
    padding: 24,
    paddingTop: 8,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  slideSub: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#EBF3FF',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  segmentActive: {
    borderColor: '#007AFF',
    backgroundColor: '#EBF3FF',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#007AFF',
  },
  segmentHint: {
    fontSize: 11,
    color: '#AEAEB2',
    marginTop: 2,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3A3A3C',
    lineHeight: 28,
  },
  counterValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});
