import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitsContext';
import { calcStreak } from '../hooks/useHabits';
import { lastNDaysAsc, formatWeekdayShort, todayISO } from '../utils/date';

function BarChart({ days, habits }: { days: string[]; habits: ReturnType<typeof useHabits>['habits'] }) {
  if (habits.length === 0) return null;
  return (
    <View style={chart.container}>
      {days.map((date) => {
        const completed = habits.filter((h) => h.completedDates.includes(date)).length;
        const pct = habits.length > 0 ? completed / habits.length : 0;
        const isToday = date === todayISO();
        return (
          <View key={date} style={chart.barGroup}>
            <View style={chart.barTrack}>
              <View
                style={[
                  chart.barFill,
                  {
                    height: Math.max(pct * 100, pct > 0 ? 4 : 0),
                    backgroundColor: isToday ? '#007AFF' : '#34C759',
                  },
                ]}
              />
            </View>
            <Text style={[chart.barLabel, isToday && chart.barLabelToday]}>
              {formatWeekdayShort(date)}
            </Text>
            <Text style={chart.barPct}>{pct > 0 ? `${Math.round(pct * 100)}%` : ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function StatsScreen() {
  const { habits, loading } = useHabits();
  const last7 = lastNDaysAsc(7);
  const last30 = lastNDaysAsc(30);

  const { completionRate30, totalCompletions, bestStreak } = useMemo(() => {
    if (habits.length === 0) return { completionRate30: 0, totalCompletions: 0, bestStreak: 0 };
    let totalSlots = 0;
    let totalDone = 0;
    last30.forEach((date) => {
      habits.forEach((h) => {
        const createdAt = h.createdAt.split('T')[0];
        if (date >= createdAt) {
          totalSlots++;
          if (h.completedDates.includes(date)) totalDone++;
        }
      });
    });
    const total = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    const best = habits.reduce((max, h) => Math.max(max, calcStreak(h.completedDates)), 0);
    return { completionRate30: totalSlots > 0 ? totalDone / totalSlots : 0, totalCompletions: total, bestStreak: best };
  }, [habits, last30]);

  if (loading) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Stats</Text>

        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyBody}>Add habits and start tracking to see stats here.</Text>
          </View>
        ) : (
          <>
            <View style={styles.cardRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{Math.round(completionRate30 * 100)}%</Text>
                <Text style={styles.statLabel}>30-day rate</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalCompletions}</Text>
                <Text style={styles.statLabel}>Total check-ins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{bestStreak}</Text>
                <Text style={styles.statLabel}>Best streak</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Last 7 days</Text>
              <Text style={styles.sectionSub}>% of habits completed per day</Text>
              <BarChart days={last7} habits={habits} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habit breakdown</Text>
              {habits.map((habit) => {
                const streak = calcStreak(habit.completedDates);
                const total = habit.completedDates.length;
                const eligible30 = last30.filter((d) => d >= habit.createdAt.split('T')[0]).length;
                const rate30 = last30.filter((d) => habit.completedDates.includes(d) && d >= habit.createdAt.split('T')[0]).length;
                const pct = eligible30 > 0 ? Math.round((rate30 / eligible30) * 100) : 0;
                return (
                  <View key={habit.id} style={styles.habitStat}>
                    <Text style={styles.habitStatEmoji}>{habit.emoji}</Text>
                    <View style={styles.habitStatInfo}>
                      <Text style={styles.habitStatTitle}>{habit.title}</Text>
                      <View style={styles.habitStatBarTrack}>
                        <View style={[styles.habitStatBarFill, { width: `${pct}%` as any }]} />
                      </View>
                      <Text style={styles.habitStatMeta}>
                        {pct}% last 30d · 🔥 {streak} streak · {total} total
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 34, fontWeight: '800', color: '#1C1C1E', marginBottom: 20, marginTop: 4 },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: '#007AFF', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#8E8E93', textAlign: 'center', fontWeight: '500' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  sectionSub: { fontSize: 13, color: '#8E8E93', marginBottom: 16 },
  habitStat: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  habitStatEmoji: { fontSize: 26, lineHeight: 32 },
  habitStatInfo: { flex: 1 },
  habitStatTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  habitStatBarTrack: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  habitStatBarFill: { height: 6, backgroundColor: '#34C759', borderRadius: 3 },
  habitStatMeta: { fontSize: 12, color: '#8E8E93' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  emptyBody: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22 },
});

const chart = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  barGroup: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barTrack: {
    width: 28,
    height: 100,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '500' },
  barLabelToday: { color: '#007AFF', fontWeight: '700' },
  barPct: { fontSize: 9, color: '#8E8E93', height: 12 },
});
