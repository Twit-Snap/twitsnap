import { Slot } from 'expo-router';
import { Provider } from 'jotai';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <Provider>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </Provider>
  );
}
