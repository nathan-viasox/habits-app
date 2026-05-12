import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Habit } from '../types';
import { todayISO } from '../utils/date';
import { calcStreak, calcChallengeProgress, getTodayVolume, HabitCompletionResult } from '../hooks/useHabits';
import { triggerCompletionHaptic, triggerLightHaptic, playCompletionChime } from '../utils/reward';
import { CelebrationOverlay, FloatingLabel } from './CelebrationOverlay';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  habit: Habit;
  onToggle: (id: string) => HabitCompletionResult;
  onIncrement: (id: string) => HabitCompletionResult;
  onDecrement: (id: string) => void;
  onDelete: (id: string) => void;
  onChallengeComplete?: () => void;
}

export function HabitRow({ habit, onToggle, onIncrement, onDecrement, onDelete, onChallengeComplete }: Props) {
  const today = todayISO();
  const completedToday = habit.completedDates.includes(today);
  const streak = calcStreak(habit.completedDates);
  const todayVolume = getTodayVolume(habit);

  const checkScale = useRef(new Animated.Value(1)).current;
  const rowBg = useRef(new Animated.Value(completedToday ? 1 : 0)).current;
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'complete' | 'challenge'>('complete');
  const [confirmVisible, setConfirmVisible] = useState(false);

  function animateCheck() {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
    ]).start();
  }

  function flashBg(to: number) {
    Animated.timing(rowBg, { toValue: to, duration: 200, useNativeDriver: false }).start();
  }

  function fireReward(result: HabitCompletionResult) {
    if (result.justCompleted) {
      animateCheck();
      flashBg(1);
      triggerCompletionHaptic();
      playCompletionChime();
      if (result.challengeJustCompleted) {
        setCelebrationType('challenge');
        onChallengeComplete?.();
      } else {
        setCelebrationType('complete');
      }
      setShowCelebration(true);
      setShowFloating(true);
    } else {
      flashBg(0);
    }
  }

  function handleToggle() {
    fireReward(onToggle(habit.id));
  }

  function handleIncrement() {
    triggerLightHaptic();
    fireReward(onIncrement(habit.id));
  }

  function handleDecrement() {
    onDecrement(habit.id);
    if (completedToday) flashBg(0);
  }

  const bgColor = rowBg.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#F0FBF4'],
  });

  const challengeProgress =
    habit.challengeDays && habit.challengeStartDate
      ? calcChallengeProgress(habit.completedDates, habit.challengeStartDate, habit.challengeDays)
      : null;

  return (
    <>
      <Animated.View style={[styles.row, { backgroundColor: bgColor }]}>
        <View style={styles.rowInner}>
          {habit.type === 'binary' ? (
            <TouchableOpacity onPress={handleToggle} activeOpacity={0.7} style={styles.checkWrap}>
              <Animated.View
                style={[styles.check, completedToday && styles.checkDone, { transform: [{ scale: checkScale }] }]}
              >
                {completedToday && <Text style={styles.checkmark}>✓</Text>}
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <View style={styles.volumeControl}>
              <TouchableOpacity style={styles.volumeBtn} onPress={handleDecrement}>
                <Text style={styles.volumeBtnText}>−</Text>
              </TouchableOpacity>
              <Animated.View style={[styles.volumeCount, completedToday && styles.volumeCountDone, { transform: [{ scale: checkScale }] }]}>
                <Text style={[styles.volumeCountText, completedToday && styles.volumeCountTextDone]}>
                  {todayVolume}
                </Text>
              </Animated.View>
              <TouchableOpacity style={styles.volumeBtn} onPress={handleIncrement}>
                <Text style={styles.volumeBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={styles.habitEmoji}>{habit.emoji}</Text>
              <Text style={[styles.title, completedToday && styles.titleDone]} numberOfLines={1}>
                {habit.title}
              </Text>
            </View>
            <View style={styles.metaRow}>
              {habit.type === 'volume' && (
                <Text style={styles.meta}>{todayVolume} / {habit.targetCount}× today</Text>
              )}
              <Text style={styles.streak}>
                {streak > 0 ? `🔥 ${streak} day streak` : 'Start your streak today'}
              </Text>
            </View>
            {challengeProgress !== null && !habit.challengeCompleted && (
              <View style={styles.challengeBadge}>
                <Text style={styles.challengeText}>
                  🎯 Day {challengeProgress} / {habit.challengeDays} challenge
                </Text>
              </View>
            )}
            {habit.challengeCompleted && (
              <View style={[styles.challengeBadge, styles.challengeDone]}>
                <Text style={[styles.challengeText, styles.challengeDoneText]}>🏆 Challenge complete!</Text>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={() => setConfirmVisible(true)} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>

        <CelebrationOverlay
          visible={showCelebration}
          type={celebrationType}
          onDone={() => setShowCelebration(false)}
        />
        <FloatingLabel
          visible={showFloating}
          label={habit.type === 'volume' ? '+1' : '✓'}
          onDone={() => setShowFloating(false)}
        />
      </Animated.View>

      <ConfirmModal
        visible={confirmVisible}
        title="Delete habit"
        message={`Remove "${habit.title}"? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmVisible(false);
          onDelete(habit.id);
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkWrap: {
    marginRight: 14,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#C0C0C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    gap: 6,
  },
  volumeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3C',
    lineHeight: 22,
  },
  volumeCount: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeCountDone: {
    backgroundColor: '#34C759',
  },
  volumeCountText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  volumeCountTextDone: {
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  habitEmoji: {
    fontSize: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  titleDone: {
    color: '#34C759',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  meta: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  streak: {
    fontSize: 12,
    color: '#8E8E93',
  },
  challengeBadge: {
    marginTop: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  challengeDone: {
    backgroundColor: '#E8F5E9',
  },
  challengeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E65100',
  },
  challengeDoneText: {
    color: '#2E7D32',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteText: {
    fontSize: 14,
    color: '#C7C7CC',
  },
});
