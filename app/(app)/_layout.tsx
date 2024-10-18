import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';

import { showTabsAtom } from '@/atoms/showTabsAtom';

import { StatusBar } from 'react-native';
import { authenticatedAtom } from '../authAtoms/authAtom';

export default function RootLayout() {
  const [isAuthenticated] = useAtom(authenticatedAtom);
  const showTabs = useAtomValue(showTabsAtom);

  if (!isAuthenticated) {
    return <Redirect href="/front-page" />;
  }

  return (
    <>
      <StatusBar backgroundColor={'rgb(5 5 5)'} barStyle={'light-content'} />
      <Tabs
        sceneContainerStyle={{
          backgroundColor: 'rgb(5 5 5)',
          paddingTop: StatusBar.currentHeight
        }}
        backBehavior="history"
      >
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
            tabBarButton: () => null, // Hide the tab
            header: () => null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="searchResults"
          options={{
            tabBarButton: () => null, // Hide the tab
            header: () => null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="searchProfile/[username]"
          options={{
            tabBarButton: () => null, // Hide the tab
            header: () => null,
            headerShown: false
          }}
        />
        <Tabs.Screen
          name="searchProfile/[username]/showFollows"
          options={{
            tabBarButton: () => null, // Hide the tab
            header: () => null,
            headerShown: false
          }}
        />
      </Tabs>
    </>
  );
}
