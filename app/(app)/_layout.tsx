import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Redirect, Tabs } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showTabsAtom } from '@/atoms/showTabsAtom';
import {
  INotificationExpectedContent,
  pushByNotificationType
} from '@/components/notifications/notificationCard';

import { authenticatedAtom } from '../authAtoms/authAtom';

export default function RootLayout() {
  const [isAuthenticated] = useAtom(authenticatedAtom);
  const showTabs = useAtomValue(showTabsAtom);

  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      pushByNotificationType(
        response.notification.request.content as unknown as INotificationExpectedContent
      );
      //QUE HACER CUANDO LA APRETAS
    });

    return () => {
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  if (!isAuthenticated) {
    return <Redirect href="/front-page" />;
  }
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
              headerShown: false,
              tabBarShowLabel: false
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
              tabBarHideOnKeyboard: true,
              tabBarStyle: { display: showTabs ? 'flex' : 'none' },
              headerShown: false,
              tabBarShowLabel: false
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
              headerShown: false,
              tabBarShowLabel: false
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
              headerShown: false,
              tabBarShowLabel: false
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
          <Tabs.Screen
            name="verification"
            options={{
              tabBarButton: () => null, // Hide the tab
              header: () => null,
              tabBarStyle: { display: 'none' },
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="profile/components/statisticsChart"
            options={{
              tabBarButton: () => null, // Hide the tab
              header: () => null,
              headerShown: false
            }}
          />
        </Tabs>
      </SafeAreaView>
    </>
  );
}
