import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HabitsProvider } from './src/context/HabitsContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <HabitsProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </HabitsProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
