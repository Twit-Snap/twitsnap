import * as Notifications from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import HomeHeader from '@/components/feed/header';
import NotificationCard, {
  INotificationExpectedContent
} from '@/components/notifications/notificationCard';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<Notifications.Notification[] | null>(null);

  const setNotificationsWithoutDups = async (notifs: Notifications.Notification[]) => {
    setNotifications((current) => {
      const ids = new Set<string>([...(current || []), ...notifs].map((n) => n.request.identifier));

      return [...(current || []), ...notifs].filter((n) => ids.has(n.request.identifier));
    });
  };

  const fetchNotifications = async () => {
    setNotificationsWithoutDups(await Notifications.getPresentedNotificationsAsync());
  };

  const receiverListener = useRef<Notifications.Subscription>();

  useFocusEffect(
    useCallback(() => {
      receiverListener.current = Notifications.addNotificationReceivedListener((notification) => {
        setNotificationsWithoutDups([notification]);
      });

      fetchNotifications();

      return () => {
        receiverListener.current &&
          Notifications.removeNotificationSubscription(receiverListener.current);
      };
    }, [])
  );

  return (
    <>
      <View style={{ minHeight: 50 }}>
        <HomeHeader />
      </View>
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'center'
        }}
      >
        {notifications ? (
          notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.request.identifier}
              renderItem={({ item }) => (
                <NotificationCard
                  content={item.request.content as unknown as INotificationExpectedContent}
                  date={item.date}
                  id={item.request.identifier}
                  onPress={(id: string) => {
                    Notifications.dismissNotificationAsync(id);
                    fetchNotifications();
                  }}
                />
              )}
              contentContainerStyle={{
                backgroundColor: 'rgb(5 5 5)'
              }}
              scrollEnabled={false}
            />
          ) : (
            <Text
              style={{
                color: 'rgb(255 255 255)',
                textAlign: 'center',
                alignContent: 'center',
                fontSize: 35
              }}
            >
              You have no notifications
            </Text>
          )
        ) : (
          <ActivityIndicator
            animating={true}
            color={'rgb(3, 165, 252)'}
            size={60}
            style={{ alignSelf: 'center' }}
          />
        )}
      </ScrollView>
    </>
  );
}
