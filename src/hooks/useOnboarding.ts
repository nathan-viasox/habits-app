import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@onboarding_complete';

export function useOnboarding() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((val) => {
      setOnboardingComplete(val === 'true');
      setLoading(false);
    });
  }, []);

  async function completeOnboarding() {
    await AsyncStorage.setItem(KEY, 'true');
    setOnboardingComplete(true);
  }

  async function resetOnboarding() {
    await AsyncStorage.removeItem(KEY);
    setOnboardingComplete(false);
  }

  return { onboardingComplete, loading, completeOnboarding, resetOnboarding };
}
