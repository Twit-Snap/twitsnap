import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';

import { showTabsAtom } from '@/atoms/showTabsAtom';

import { authenticatedAtom } from '../authAtoms/authAtom';

export default function RootLayout() {
  const [isAuthenticated] = useAtom(authenticatedAtom);

  if (!isAuthenticated) {
    return <Redirect href="/front-page" />;
  }

  const showTabs = useAtomValue(showTabsAtom);
  return (
    <Tabs sceneContainerStyle={{ backgroundColor: 'rgb(5 5 5)' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          header: () => <></>,
          tabBarHideOnKeyboard: true,
          tabBarStyle: { display: showTabs ? 'flex' : 'none' },
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          tabBarHideOnKeyboard: true,
          tabBarStyle: { display: showTabs ? 'flex' : 'none' },
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarHideOnKeyboard: true,
          tabBarStyle: { display: showTabs ? 'flex' : 'none' },
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="searchResults"
        options={{
          title: 'searchResults',
          tabBarButton: () => null, // Hide the tab
          header: () => <></>
        }}
      />
      <Tabs.Screen
        name="searchProfile/[username]"
        options={{
          title: 'searchProfile',
          tabBarButton: () => null, // Hide the tab
          header: () => <></>
        }}
      />
    </Tabs>
  );
}
