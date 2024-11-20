import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';

export interface IMessage {
  content: string;
  id: string;
  sender_id: number;
  created_at: string;
  edited_at?: string;
}

interface IMessageCardProps {
  item: IMessage;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, current_content: string) => Promise<void>;
}

export default function MessageCard({ item, onEdit, onDelete }: IMessageCardProps) {
  const { content, created_at, sender_id, id } = item;
  const authUserId = useAtomValue(authenticatedAtom)?.id;

  const authUserIsSender = sender_id === authUserId;
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleShowMenu = () => {
    setShowMenu(true);
    setTimeout(() => setShowMenu(false), 2000);
  };

  return (
    <View
      style={[
        {
          flex: 1,
          flexDirection: authUserIsSender ? 'row-reverse' : 'row',
          padding: 10,
          maxWidth: '70%'
        },
        authUserIsSender ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
      ]}
    >
      <View>
        <TouchableOpacity
          style={[
            styles.messageContainer,
            authUserIsSender
              ? { borderBottomLeftRadius: 20, backgroundColor: 'rgb(4, 138, 209)' }
              : { borderBottomRightRadius: 20, backgroundColor: 'rgb(36, 46, 54)' }
          ]}
          onLongPress={() => setShowMenu(true)}
          onPressOut={() => showMenu && setTimeout(() => setShowMenu(false), 2000)}
        >
          <Text style={styles.messageContent}>{content}</Text>
          {item.edited_at && (
            <Text
              style={[
                { fontWeight: 'bold', fontSize: 12, lineHeight: 12 },
                authUserIsSender
                  ? { alignSelf: 'flex-end', color: 'rgb(50 50 50)' }
                  : { alignSelf: 'flex-start', color: 'gray' }
              ]}
            >
              Edited
            </Text>
          )}
        </TouchableOpacity>
        <View
          style={[
            styles.messageFooter,
            authUserIsSender ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
          ]}
        >
          <Text style={styles.timestamp}>
            {new Date(created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </Text>
        </View>
      </View>
      {showMenu && authUserIsSender && (
        <View
          style={[
            styles.menuContainer,
            authUserIsSender
              ? { flexDirection: 'row-reverse', marginRight: 10 }
              : { flexDirection: 'row', marginLeft: 10 }
          ]}
        >
          <TouchableOpacity>
            <IconButton
              icon={'pencil'}
              iconColor="white"
              size={20}
              onPress={() => {
                onEdit(id, content);
                setShowMenu(false);
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <IconButton
              icon={'delete'}
              iconColor="rgb(255 70 70)"
              size={20}
              onPress={() => {
                onDelete(id);
                setShowMenu(false);
              }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  messageContent: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'semibold'
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5
  },
  timestamp: {
    fontSize: 14,
    lineHeight: 14,
    color: '#888'
  },
  menuContainer: {
    backgroundColor: 'rgb(80 80 80)',
    borderRadius: 20,
    alignSelf: 'center',
    // marginBottom: 20,
    maxHeight: 50
  }
});
