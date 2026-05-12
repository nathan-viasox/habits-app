# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack
- Expo ~54 (`blank-typescript` template, **New Architecture enabled**)
- React Native 0.81, React 19, TypeScript ~5.9 (`strict: true`)
- React Navigation v7 (bottom tabs + native stack)
- `@react-native-async-storage/async-storage` — sole persistence layer (key: `@habits_v2`)
- `expo-av` — bundled WAV audio (native); Web Audio API singleton (web)
- `expo-haptics` — native only, lazily required
- `expo-notifications` — native only, lazily required

## Commands
```bash
npm start          # Expo DevTools + QR code (scan with Expo Go on device)
npm run web        # Browser (localhost)
npm run ios        # iOS simulator
npm run android    # Android emulator
npx tsc --noEmit  # Type-check without building
```

No test runner or linter is configured.

## Architecture

### State management
**Never call `useHabits()` from `src/hooks/useHabits.ts` directly in screens.** That hook is the raw implementation and is instantiated once inside `HabitsContext`. Screens must import `useHabits` from `src/context/HabitsContext` and `useOnboarding` from `src/context/OnboardingContext`. Breaking this rule causes each screen to get independent state and storage writes.

`App.tsx` wraps everything: `SafeAreaProvider → OnboardingProvider → HabitsProvider → RootNavigator`.

### Navigation
`RootNavigator` (`src/navigation/RootNavigator.tsx`) conditionally renders either `Onboarding` (stack screen) or the full app based on `onboardingComplete`. The full app is a bottom-tab navigator (`Today / Log / Stats / Settings`) nested inside the root stack. `AddHabit` and `HowItWorks` are modal stack screens pushed on top of the tabs.

### Data model
`Habit` (`src/types/index.ts`) — key fields:
- `type: 'binary' | 'volume'` — binary is a once-per-day toggle; volume tracks a count against `targetCount`
- `completedDates: string[]` — ISO dates (`"YYYY-MM-DD"`); a date is added when the habit is done that day
- `volumeLogs: VolumeLog[]` — `{ date, count }` records for volume habits
- `challengeDays / challengeStartDate / challengeCompleted` — optional challenge fields; `calcChallengeProgress` counts completedDates that fall within the challenge window

### Reward system (`src/utils/reward.ts`)
- **Web**: singleton `AudioContext` (`_audioCtx`) with `resume()` before each play — Chrome blocks creating new contexts outside user gestures
- **Native**: `expo-av` `Audio.Sound.createAsync` with `require('../../assets/sounds/chime.wav')` / `challenge.wav`; `playsInSilentModeIOS: true` is set once via `audioModeReady` flag; sound is unloaded in `setOnPlaybackStatusUpdate` after finishing
- Haptics are lazily `require`d only on non-web platforms

### Cross-platform rules
- `SafeAreaView` must come from `react-native-safe-area-context`, not `react-native`
- Never use `Alert.alert` for confirmations — use `ConfirmModal` (`src/components/ConfirmModal.tsx`); `Alert` maps to `window.confirm()` on web which doesn't support named button callbacks
- `expo-haptics` and `expo-notifications` are both conditionally loaded (`Platform.OS !== 'web'`)

### Utility exports
- `src/utils/date.ts` — `todayISO()`, `formatDisplayDate()` — use these instead of `new Date()` inline
- `src/hooks/useHabits.ts` — also exports `calcStreak`, `calcChallengeProgress`, `getTodayVolume` as named exports for use in screens/components that only need to read (not mutate) habit data

### Developer tools
`SettingsScreen` has a "Developer Tools" section with a `simulateChallengeDays(habitId, n)` button per active challenge — fills `completedDates` to instantly trigger challenge completion for testing reward animations and sounds.
