import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const SECTIONS = [
  {
    step: '01',
    emoji: '✏️',
    title: 'Create a habit',
    color: '#EBF3FF',
    accentColor: '#007AFF',
    body: 'Tap the + button on the Today screen. Give your habit a name, an icon, and choose how you want to track it:\n\n• Daily — mark it done once each day\n• Volume — hit a target count (e.g. drink water 8× a day)\n\nYou can also add a challenge at creation time.',
  },
  {
    step: '02',
    emoji: '✅',
    title: 'Track it daily',
    color: '#E8F5E9',
    accentColor: '#34C759',
    body: 'Each day, open the Today tab and mark your habits complete. The app rewards you with:\n\n🎵 A satisfying chime\n📳 Haptic feedback (on device)\n✨ An animation burst\n\nKeep completing day after day to build a streak. Streaks are shown as 🔥 on each habit.',
  },
  {
    step: '03',
    emoji: '🏆',
    title: 'Hit a challenge',
    color: '#FFF3E0',
    accentColor: '#FF6D00',
    body: 'Challenges are streaks with a finish line — 3, 7, or 30 days. When you create a habit you can attach a challenge.\n\nThe habit card shows your daily progress (Day 2 / 3). Hit every day of the challenge and you\'ll unlock a special reward animation and sound.\n\nCompleted challenges are permanently shown with a 🏆 badge.',
  },
  {
    step: '04',
    emoji: '🔔',
    title: 'Push notifications',
    color: '#F3E8FF',
    accentColor: '#7C3AED',
    body: 'Never forget a habit with daily reminders. Set a reminder time per habit when you create it — or use the default time in Settings.\n\nYou\'ll get a nudge at the time you chose:\n• Morning reminders to start strong\n• Evening reminders so nothing slips through\n\nNotifications are fully customizable and can be turned off any time in Settings.',
  },
];

export function HowItWorksScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Everything you need to know about building habits that actually stick.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.step} style={[styles.card, { borderLeftColor: s.accentColor }]}>
            <View style={[styles.stepBadge, { backgroundColor: s.color }]}>
              <Text style={[styles.stepNumber, { color: s.accentColor }]}>{s.step}</Text>
            </View>
            <View style={styles.cardEmoji}>
              <Text style={styles.cardEmojiText}>{s.emoji}</Text>
            </View>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardBody}>{s.body}</Text>
          </View>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Pro tip</Text>
          <Text style={styles.tipBody}>
            Start with just one habit. The onboarding 3-day challenge is designed for this — pick something simple, nail it three days in a row, and let the momentum carry you forward.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  backBtn: { minWidth: 60 },
  backText: { fontSize: 17, color: '#007AFF' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  content: { padding: 20 },
  intro: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepNumber: { fontSize: 14, fontWeight: '800' },
  cardEmoji: { marginBottom: 4 },
  cardEmojiText: { fontSize: 28 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: '#FFFDE7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 8,
  },
  tipBody: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 22,
  },
});
