import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '../context/HabitsContext';
import { formatDisplayDate } from '../utils/date';

interface LogEntry {
  habitId: string;
  emoji: string;
  title: string;
  type: 'binary' | 'volume';
  count?: number;
  target?: number;
}

interface DaySection {
  date: string;
  data: LogEntry[];
}

export function LogScreen() {
  const { habits, loading } = useHabits();

  const sections = useMemo<DaySection[]>(() => {
    const dateMap = new Map<string, LogEntry[]>();
    habits.forEach((habit) => {
      habit.completedDates.forEach((date) => {
        const existing = dateMap.get(date) ?? [];
        const volumeLog = habit.volumeLogs.find((l) => l.date === date);
        existing.push({
          habitId: habit.id,
          emoji: habit.emoji,
          title: habit.title,
          type: habit.type,
          count: volumeLog?.count,
          target: habit.targetCount,
        });
        dateMap.set(date, existing);
      });
    });
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => ({ date, data }));
  }, [habits]);

  if (loading) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBlock}>
        <Text style={styles.heading}>Activity Log</Text>
        <Text style={styles.subheading}>{sections.length} days with activity</Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Nothing logged yet</Text>
          <Text style={styles.emptyBody}>
            Complete habits on the Today tab to see your history here.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.habitId}-${index}`}
          contentContainerStyle={styles.content}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDate}>{formatDisplayDate(section.date)}</Text>
              <Text style={styles.sectionCount}>
                {section.data.length} habit{section.data.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.logRow}>
              <Text style={styles.logEmoji}>{item.emoji}</Text>
              <View style={styles.logInfo}>
                <Text style={styles.logTitle}>{item.title}</Text>
                {item.type === 'volume' && item.count !== undefined && (
                  <Text style={styles.logMeta}>{item.count} / {item.target}× completed</Text>
                )}
              </View>
              <Text style={styles.logCheck}>✓</Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  headerBlock: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  heading: { fontSize: 34, fontWeight: '800', color: '#1C1C1E' },
  subheading: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  content: { padding: 20, paddingTop: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionDate: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  sectionCount: { fontSize: 13, color: '#8E8E93' },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    gap: 12,
  },
  logEmoji: { fontSize: 22 },
  logInfo: { flex: 1 },
  logTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  logMeta: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  logCheck: { fontSize: 16, color: '#34C759', fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  emptyBody: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 22 },
});
