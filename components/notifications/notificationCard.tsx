import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface INotificationExpectedContent {
  body: string;
  title: string;
  data?: {
    params: {
      id?: string;
      user?: string;
    };
    pathname: string;
    type: string;
  };
}

interface INotificationCardProps {
  content: INotificationExpectedContent;
  date: number;
  id: string;
  onPress: (id: string) => void;
}

export function pushByNotificationType(content: INotificationExpectedContent) {
  if (!content.data) {
    return;
  }

  console.log(content.data);

  switch (content.data.type) {
    case 'message':
      router.push({
        pathname: '/(app)/chat/[id]',
        params: {
          id: `${content.data.params.id}`,
          user: `${content.data.params.user}`
        }
      });
      break;

    case 'twit-mention':
      router.push({
        pathname: '/(app)/twits/[id]',
        params: {
          id: `${content.data.params.id}`
        }
      });
      break;

    default:
      router.push({
        pathname: '/(app)/home',
        params: undefined
      });
      break;
  }
}

export default function NotificationCard({ content, date, id, onPress }: INotificationCardProps) {
  return (
    <TouchableOpacity
      style={[styles.notificationItem]}
      onPress={() => {
        onPress(id);
        pushByNotificationType(content);
      }}
    >
      <View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.date}>
            {new Date(date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </Text>
        </View>
        <Text style={styles.body}>{content.body}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgb(5 5 5)',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'rgb(50 50 50)',
    borderBottomWidth: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 16,
    textAlignVertical: 'center',
    color: 'white'
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  date: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#eee',
    lineHeight: 12,
    textAlignVertical: 'center',
    marginBottom: 3
  }
});
