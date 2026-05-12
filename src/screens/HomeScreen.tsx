import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHabits } from '../context/HabitsContext';
import { HabitRow } from '../components/HabitRow';
import { todayISO, formatDisplayDate } from '../utils/date';
import type { RootStackParamList } from '../types/navigation';
import { playChallengeChime, triggerChallengeHaptic } from '../utils/reward';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { habits, loading, toggleToday, incrementVolume, decrementVolume, deleteHabit } = useHabits();
  const today = todayISO();
  const completedCount = habits.filter((h) => h.completedDates.includes(today)).length;
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);

  function handleChallengeComplete() {
    triggerChallengeHaptic();
    playChallengeChime();
    setChallengeModalVisible(true);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  const allDone = habits.length > 0 && completedCount === habits.length;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.dateLabel}>{formatDisplayDate(today)}</Text>
            <Text style={styles.heading}>Today</Text>
            {habits.length > 0 && (
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {completedCount} of {habits.length} done
                </Text>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(completedCount / habits.length) * 100}%` as any },
                    ]}
                  />
                </View>
              </View>
            )}
            {allDone && (
              <View style={styles.allDoneBanner}>
                <Text style={styles.allDoneText}>🎉 All habits done for today!</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <HabitRow
            habit={item}
            onToggle={toggleToday}
            onIncrement={incrementVolume}
            onDecrement={decrementVolume}
            onDelete={deleteHabit}
            onChallengeComplete={handleChallengeComplete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyBody}>Tap + to add your first habit.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHabit', undefined)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Challenge completion modal */}
      <Modal
        visible={challengeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🏆</Text>
            <Text style={styles.modalTitle}>Challenge Complete!</Text>
            <Text style={styles.modalBody}>
              You stuck to your habit every single day of the challenge. That's the kind of consistency that builds real change.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setChallengeModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Keep going! 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F2F7' },
  content: { padding: 20, paddingTop: 12, paddingBottom: 100 },
  dateLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heading: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  progressRow: { marginBottom: 20 },
  progressText: { fontSize: 13, color: '#8E8E93', marginBottom: 6 },
  progressBarTrack: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#34C759', borderRadius: 3 },
  allDoneBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  allDoneText: { fontSize: 15, fontWeight: '600', color: '#2E7D32' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  emptyBody: { fontSize: 15, color: '#8E8E93', textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: { fontSize: 28, color: '#fff', lineHeight: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalEmoji: { fontSize: 64, marginBottom: 16 },
  modalTitle: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginBottom: 12 },
  modalBody: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  modalBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
