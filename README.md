# Habit Tracker — Mobile App

A cross-platform habit tracking app built with Expo and React Native, following Nick's mobile development course.

## Features

- **Binary & Volume habits** — track once-per-day completions or count-based goals
- **Challenges** — run 3, 7, or 30-day challenge windows per habit
- **Streaks & Stats** — visualize progress over time
- **Rewards** — haptic feedback + audio chimes on habit completion and challenge wins
- **Reminders** — per-habit push notifications with custom time
- **Onboarding** — first-launch walkthrough

## Stack

- [Expo](https://expo.dev) ~54 (New Architecture, `blank-typescript` template)
- React Native 0.81 / React 19 / TypeScript 5.9
- React Navigation v7 — bottom tabs + native stack
- AsyncStorage — local persistence
- `expo-av` — audio playback
- `expo-haptics` / `expo-notifications`

## Getting Started

```bash
npm install
npm start        # Expo DevTools + QR code (Expo Go on device)
npm run web      # Browser
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

Type-check without building:
```bash
npx tsc --noEmit
```

## Project Structure

```
src/
  components/    # Reusable UI (ConfirmModal, etc.)
  context/       # HabitsContext, OnboardingContext
  hooks/         # useHabits (raw impl), useOnboarding
  navigation/    # RootNavigator
  screens/       # Today, Log, Stats, Settings, AddHabit, HowItWorks, Onboarding
  types/         # Habit, VolumeLog, nav param types
  utils/         # date helpers, reward system, notifications
```

## Data

Habits are persisted to AsyncStorage under the key `@habits_v2` as a JSON array of `Habit` objects.
