import { Slot } from 'expo-router';
import { Provider } from 'jotai';
import React, { useEffect } from 'react';
import { en, registerTranslation } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initializeFirebase } from '@/firebaseConfig';
registerTranslation('en', en);

export default function Root() {
  // Set up the auth context and render our layout inside of it.

  // Initialize Firebase
  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <Provider>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </Provider>
  );
}
