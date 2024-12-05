import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';

import { IReducedUser } from '@/app/types/publicUser';
import MessageCard, { IMessage } from '@/components/chat/messageCard';
import { db } from '@/firebaseConfig';
import useAxiosInstance from '@/hooks/useAxios';

const window = Dimensions.get('screen');

const default_images = {
  default_profile_picture: require('../../../../assets/images/no-profile-picture.png')
};

const ChatScreen = () => {
  const chat_id = useLocalSearchParams<{ id: string; user: string }>().id;
  const userParam = useLocalSearchParams<{ id: string; user: string }>().user;

  const getUserParam = (uParam: string): IReducedUser | string => {
    try {
      return JSON.parse(uParam);
    } catch {
      return uParam;
    }
  };

  const user = getUserParam(userParam);
  const userRef = useRef<IReducedUser>({} as IReducedUser);

  const [messages, setMessages] = useState<IMessage[] | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const [inputHeight, setInputHeight] = useState<number>(45);
  const axiosMessages = useAxiosInstance('messages');
  const axiosUsers = useAxiosInstance('users');

  const editRef = useRef<string>('');
  const inputRef = useRef<TextInput | null>(null);

  const handleSubmit = async () => {
    const promise = axiosMessages
      .post(`chats/${chat_id}`, {
        content: newMessage.trim(),
        receiver_expo_token: userRef.current?.expoToken
      })
      .catch((error) => {});

    setNewMessage('');
    setInputHeight(45);
    await promise;
  };

  const handleSubmitEdit = async () => {
    const promise = axiosMessages
      .patch(`chats/${chat_id}/messages/${editRef.current}`, { content: newMessage.trim() })
      .catch((error) => {});

    editRef.current = '';
    setNewMessage('');
    setInputHeight(45);
    await promise;
  };

  const handleEdit = async (message_id: string, current_content: string) => {
    inputRef.current?.focus();
    editRef.current = message_id;
    setNewMessage(current_content);
  };

  const handleDelete = async (message_id: string) => {
    await axiosMessages.delete(`chats/${chat_id}/messages/${message_id}`).catch((error) => {});
  };

  const getUser = async (username: string) => {
    await axiosUsers
      .get(`users/${username}`, { params: { reduce: true } })
      .then(({ data }) => (userRef.current = data.data))
      .catch(() => (userRef.current = {} as IReducedUser));
  };

  useFocusEffect(
    useCallback(() => {
      if (!chat_id) {
        return;
      }

      if (typeof user === 'string') {
        console.log('User is a string');
        getUser(user);
      } else if (user.followCreatedAt !== undefined) {
        console.log('User from follow');
        getUser(user.username);
      } else {
        console.log('is an IReducedUser');
        userRef.current = user;
      }

      const messagesRef = ref(db, `messages/` + chat_id);

      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const values = snapshot.val();

        if (!values) {
          setMessages([]);
          return;
        }

        const data = Object.entries(values).map(([k, v]) => ({
          id: k,
          ...(v as object)
        }));

        console.log(`[${chat_id}] Firebase #messages: `, data.length);

        setMessages(
          (data as IMessage[]).sort((a, b) => {
            // Parse the ISO 8601 strings into Date objects
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);

            // Compare the Date objects
            return dateB.getTime() - dateA.getTime();
          })
        );
      });

      return () => {
        unsubscribe();
        setMessages(null);
      };
    }, [chat_id])
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={{ paddingBottom: 20 }}>
        <View style={styles.containerSearch}>
          <TouchableOpacity onPress={router.back} style={{ paddingRight: 9 }}>
            <IconButton icon="arrow-left" iconColor="rgb(255 255 255)" size={24} />
          </TouchableOpacity>
          <View
            style={{
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'flex-start',
              flex: 1,
              flexDirection: 'row'
            }}
          >
            <Image
              source={
                userRef.current.profilePicture
                  ? { uri: userRef.current.profilePicture }
                  : default_images.default_profile_picture
              }
              style={styles.profilePicture}
            />
            <Text
              style={{
                marginLeft: 10,
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                lineHeight: 16,
                textAlignVertical: 'center'
              }}
            >
              {userRef.current.name}
            </Text>
          </View>
        </View>
      </View>
      {messages ? (
        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageCard item={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        />
      ) : (
        <View style={{ flex: 1, height: '100%' }}>
          <ActivityIndicator
            animating={true}
            color={'rgb(3, 165, 252)'}
            size={60}
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}
      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignContent: 'center',
          justifyContent: 'center'
        }}
      >
        <TextInput
          placeholder={'Start a message'}
          placeholderTextColor="rgb(150 150 150)"
          onChangeText={setNewMessage}
          onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
          value={newMessage}
          style={[styles.searchbar, { height: Math.max(45, inputHeight) }]}
          maxLength={280}
          numberOfLines={5}
          multiline={true}
          ref={inputRef}
        />
        <IconButton
          onPress={editRef.current !== '' ? handleSubmitEdit : handleSubmit}
          icon="send"
          size={30}
          style={{
            backgroundColor: 'rgb(3 165 252)',
            alignSelf: 'flex-start',
            bottom: 7,
            borderRadius: 30
          }}
          iconColor="white"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  message: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: '80%'
  },
  sentMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end'
  },
  receivedMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start'
  },
  messageText: {
    color: '#fff'
  },
  timestamp: {
    color: '#rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 5
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 20
  },
  sendButtonText: {
    color: 'white'
  },
  containerSearch: {
    backgroundColor: 'rgb(5 5 5)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    width: window.width,
    maxHeight: 50,
    minHeight: 50,
    paddingVertical: 15,
    alignItems: 'center'
  },
  searchbar: {
    backgroundColor: 'rgb(46 46 46)',
    // width: window.width * 0.8,
    maxWidth: window.width * 0.85,
    minWidth: window.width * 0.85,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 10,
    marginLeft: 5,
    color: 'rgb(255 255 255)',
    fontSize: 16,
    lineHeight: 16
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 25
  }
});

export default ChatScreen;
