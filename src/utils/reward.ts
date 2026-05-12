import { Platform } from 'react-native';

// ─── Haptics (native only) ────────────────────────────────────────────────────

let Haptics: typeof import('expo-haptics') | null = null;
if (Platform.OS !== 'web') {
  Haptics = require('expo-haptics');
}

export async function triggerCompletionHaptic() {
  if (!Haptics) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export async function triggerLightHaptic() {
  if (!Haptics) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export async function triggerChallengeHaptic() {
  if (!Haptics) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await delay(200);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await delay(200);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

// ─── Sound ────────────────────────────────────────────────────────────────────

export function playCompletionChime() {
  if (Platform.OS === 'web') {
    playWebTones(COMPLETION_NOTES);
  } else {
    playBundledSound(require('../../assets/sounds/chime.wav'));
  }
}

export function playChallengeChime() {
  if (Platform.OS === 'web') {
    playWebTones(CHALLENGE_NOTES);
  } else {
    playBundledSound(require('../../assets/sounds/challenge.wav'));
  }
}

// ─── Web Audio (singleton AudioContext) ──────────────────────────────────────

type ToneNote = { freq: number; duration: number; offset?: number };

const COMPLETION_NOTES: ToneNote[] = [
  { freq: 523, duration: 0.13 },
  { freq: 659, duration: 0.13, offset: 0.09 },
  { freq: 784, duration: 0.20, offset: 0.18 },
];

const CHALLENGE_NOTES: ToneNote[] = [
  { freq: 523,  duration: 0.18 },
  { freq: 659,  duration: 0.18, offset: 0.11 },
  { freq: 784,  duration: 0.18, offset: 0.22 },
  { freq: 1047, duration: 0.40, offset: 0.33 },
];

// Singleton — Chrome only allows AudioContext creation inside a user gesture
// the first time. After that we resume the same context.
let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!_audioCtx) _audioCtx = new AC() as AudioContext;
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  } catch {
    return null;
  }
}

function playWebTones(notes: ToneNote[]) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  notes.forEach(({ freq, duration, offset = 0 }) => {
    try {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t0 = ctx.currentTime + offset;
      // Short attack then exponential decay
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.28, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch {}
  });
}

// ─── Native Audio (expo-av + bundled assets) ──────────────────────────────────

let audioModeReady = false;

function playBundledSound(asset: number) {
  (async () => {
    try {
      const { Audio } = require('expo-av') as typeof import('expo-av');

      // iOS: allow sound even when the silent switch is on
      if (!audioModeReady) {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        audioModeReady = true;
      }

      const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true });

      // Unload once finished to free memory
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {}
  })();
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
