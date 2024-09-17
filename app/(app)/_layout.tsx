import { Redirect, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';

import { useAtom } from 'jotai';
import { authenticatedAtom } from '../authAtoms/authAtom';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [isAuthenticated] = useAtom(authenticatedAtom);

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Feed',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" size={size} color={color} />
              ),
            }}
          />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
  );
}
