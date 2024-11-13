import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { IReducedUser } from '@/app/types/publicUser';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import ChatCard from '@/components/chat/chatCard';
import HomeHeader from '@/components/feed/header';
import UserCard from '@/components/profile/userCard';
import useAxiosInstance from '@/hooks/useAxios';
import removeDuplicates from '@/utils/removeDup';
import { useRouter } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { db } from '../../../firebaseConfig';

const window = Dimensions.get('screen');

interface IChatBase {
  created_at: string;
  updated_at?: string;
  participants: {
    user1: { id: number; username: string };
    user2: { id: number; username: string };
  };
}

interface IChat {
  id: string;
  created_at: string;
  updated_at?: string;
  user: IReducedUser;
}

const ChatListScreen = () => {
  const [chats, setChats] = useState<IChat[] | null>(null);
  const currentUser = useAtomValue(authenticatedAtom);
  const router = useRouter();

  const [animatedValue] = useState(new Animated.Value(window.height));
  const [isExpanded, setIsExpanded] = useState(false);

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);
  const axiosUsers = useAxiosInstance('users');
  const axiosMessages = useAxiosInstance('messages');

  const [matchingUsers, setMatchingUsers] = useState<IReducedUser[] | null>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const joinUsers = async (
      l: {
        id: string;
        user: { id: number; username: string };
        created_at: string;
        updated_at?: string;
      }[]
    ): Promise<void> => {
      const chats = await Promise.all(
        l.map(async ({ id, user, created_at, updated_at }) => {
          return await axiosUsers
            .get(`users/${user.username}`, { params: { reduce: true } })
            .then(
              ({ data }) =>
                ({
                  id,
                  user: { id: data.data.userId, ...data.data },
                  created_at,
                  updated_at
                }) as IChat
            )
            .catch(
              () =>
                ({
                  id,
                  user: { id: user.id, username: user.username } as IReducedUser,
                  created_at,
                  updated_at
                }) as IChat
            );
        })
      );

      setChats(() =>
        chats.sort((a, b) => {
          // Parse the ISO 8601 strings into Date objects
          const dateA = new Date(a.updated_at || a.created_at);
          const dateB = new Date(b.updated_at || b.created_at);

          // Compare the Date objects
          return dateB.getTime() - dateA.getTime();
        })
      );
    };

    const chatsRef = ref(db, 'chats');
    const unsubscribe = onValue(chatsRef, (snapshot: any) => {
      const data = snapshot.val();

      if (!data) {
        setChats([]);
        return;
      }

      const chatList = Object.entries(data)
        .filter(([, val]) => {
          const participants = (val as IChatBase).participants;

          return (
            participants.user1.id === currentUser?.id || participants.user2.id === currentUser?.id
          );
        })
        .map(([id, val]) => {
          const participants = (val as IChatBase).participants;
          return {
            id,
            user:
              participants.user1.id === currentUser?.id ? participants.user2 : participants.user1,
            created_at: (val as IChatBase).created_at,
            updated_at: (val as IChatBase).updated_at
          };
        });

      const newChats = removeDuplicates(chatList);

      joinUsers(newChats);
      console.log('updated');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchUsers = async (query: string): Promise<void> => {
    try {
      const response = await axiosUsers.get(`users/${currentUser?.username}/followers`, {
        params: { byFollowers: false, limit: 20, has: query }
      });

      console.log('Fetched ', response.data.length, ' users');
      setMatchingUsers(response.data);
    } catch (error) {
      console.log(`No users: ${query}, `, error);
      setMatchingUsers([]);
    }
  };

  const goToChat = async (user: IReducedUser) => {
    await axiosMessages
      .post('chats', {
        user1: { id: currentUser?.id, username: currentUser?.username },
        user2: {
          id: user.id || (user as unknown as { userId: number }).userId,
          username: user.username
        }
      })
      .then(({ data }) => {
        router.push({
          pathname: '/(app)/chat/[id]',
          params: {
            id: data.id,
            user: JSON.stringify(user)
          }
        });
      });
  };

  const handlePress = () => {
    if (matchingUsers == null) {
      fetchUsers(searchQuery);
    }

    setShowTabs(!showTabs);
    Animated.timing(animatedValue, {
      toValue: isExpanded ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpanded(!isExpanded);
    });
    Keyboard.dismiss();
    setSearchQuery('');
  };

  const handleUsersSearchContentChange = async (target: string) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    setSearchQuery(target);
    timeout.current = setTimeout(() => fetchUsers(target), 350);
  };

  return (
    <>
      <HomeHeader />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            justifyContent: 'center'
          }}
        >
          {chats ? (
            chats.length === 0 ? (
              <Text
                style={{
                  color: 'rgb(255 255 255)',
                  textAlign: 'center',
                  alignContent: 'center',
                  fontSize: 35
                }}
              >
                Start a new chat using{'\n'}
                <IconButton
                  icon="plus"
                  style={{
                    backgroundColor: 'rgb(3, 165, 252)',
                    width: 30,
                    height: 30,
                    alignSelf: 'center'
                  }}
                  iconColor="rgb(255 255 255)"
                />
              </Text>
            ) : (
              <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <ChatCard item={item.user} handler={(username: string) => goToChat(item.user)} />
                )}
                contentContainerStyle={{
                  backgroundColor: 'rgb(5 5 5)'
                }}
                scrollEnabled={false}
              />
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
      </View>
      <IconButton
        icon="plus"
        style={{
          backgroundColor: 'rgb(3, 165, 252)',
          zIndex: 10,
          alignSelf: 'flex-end',
          width: 55,
          height: 55,
          borderRadius: 200,
          position: 'absolute',
          top: window.height * 0.78,
          right: 15
        }}
        iconColor="rgb(255 255 255)"
        onPress={handlePress}
      />
      <Animated.View
        style={[
          {
            backgroundColor: 'rgb(5 5 5)',
            zIndex: 50,
            position: 'absolute',
            bottom: 0,
            top: 0,
            width: window.width
          },
          {
            transform: [{ translateY: animatedValue }],
            bottom: 0
          }
        ]}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <View style={{ height: window.height }}>
            <View style={styles.containerSearch}>
              <TouchableOpacity onPress={handlePress} style={{ paddingRight: 9 }}>
                <IconButton icon="close" iconColor="rgb(255 255 255)" size={24} />
              </TouchableOpacity>
              <TextInput
                placeholder={'Search TwitSnap'}
                placeholderTextColor="rgb(150 150 150)"
                onChangeText={handleUsersSearchContentChange}
                value={searchQuery}
                style={styles.searchbar}
                maxLength={80}
              />
            </View>
          </View>
          {matchingUsers && matchingUsers.length > 0 ? (
            <View
              style={{
                height: window.height,
                borderTopWidth: 1,
                bottom: window.height * 0.92,
                borderTopColor: 'rgb(50 50 50)',
                zIndex: 51
              }}
            >
              <FlatList
                style={{ marginBottom: 11 }}
                keyboardShouldPersistTaps="always"
                data={matchingUsers}
                renderItem={({ item }) => (
                  <UserCard
                    item={item}
                    handler={(username: string) => {
                      setTimeout(handlePress, 1000);
                      setMatchingUsers(null);
                      goToChat(item);
                    }}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          ) : (
            <></>
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  userItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  userEmail: {
    fontSize: 16
  },
  signOutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold'
  },
  containerSearch: {
    backgroundColor: 'rgb(5 5 5)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    width: window.width,
    maxHeight: 50,
    alignItems: 'center'
  },
  searchbar: {
    backgroundColor: 'rgb(46 46 46)',
    width: window.width * 0.8,
    height: 35,
    marginRight: 10,
    paddingHorizontal: 20,
    borderRadius: 200,
    color: 'rgb(255 255 255)',
    fontSize: 16
  }
});

export default ChatListScreen;
