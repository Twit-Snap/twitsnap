import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showTabsAtom } from '@/atoms/showTabsAtom';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import * as Notifications from 'expo-notifications';
import { authenticatedAtom } from '../authAtoms/authAtom';

export default function RootLayout() {
  const [isAuthenticated] = useAtom(authenticatedAtom);
  const showTabs = useAtomValue(showTabsAtom);

  if (!isAuthenticated) {
    return <Redirect href="/front-page" />;
  }

  const [expoPushToken, setExpoPushToken] = useState('');
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token: string | undefined) => {
      token && setExpoPushToken(token);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
      //QUE HACER CUANDO LA APRETAS
    });

    return () => {
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <>
      <StatusBar backgroundColor={'rgb(5 5 5)'} barStyle={'light-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveBackgroundColor: 'rgb(5 5 5)',
            tabBarInactiveBackgroundColor: 'rgb(5 5 5)',
            tabBarInactiveTintColor: 'rgb(200 200 200)'
          }}
          sceneContainerStyle={{
            backgroundColor: 'rgb(5 5 5)'
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
            name="searchResults"
            options={{
              tabBarButton: () => null, // Hide the tab
              header: () => null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="profile/[username]"
            options={{
              tabBarButton: () => null, // Hide the tab
              header: () => null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="profile/[username]/showFollows"
            options={{
              tabBarButton: () => null, // Hide the tab
              header: () => null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="twits/[id]"
            options={{
              tabBarButton: () => null, // Hide the tab
              header: () => null,
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="notifications-outline" size={size} color={color} />
              ),
              tabBarHideOnKeyboard: true,
              tabBarStyle: { display: showTabs ? 'flex' : 'none' },
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="chat/index"
            options={{
              title: 'Chat',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbox-outline" size={size} color={color} />
              ),
              tabBarHideOnKeyboard: true,
              tabBarStyle: { display: showTabs ? 'flex' : 'none' },
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="chat/[id]/index"
            options={{
              tabBarButton: () => null, // Hide the tab
              header: () => null,
              tabBarStyle: { display: 'none' },
              headerShown: false
            }}
          />
        </Tabs>
      </SafeAreaView>
    </>
  );
}
