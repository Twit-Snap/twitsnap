import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { SearchedUser } from '@/app/types/publicUser';
import axios from 'axios';
import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { Button, IconButton, TextInput } from 'react-native-paper';
import UserCard from '../profile/userCard';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface NewTweetInputProps {
  onTweetSend: (tweetContent: string) => void;
  onClose: () => void;
  placeholder?: string;
}

const NewTweetInput: React.FC<NewTweetInputProps> = ({ onTweetSend, onClose, placeholder }) => {
  const [tweetContent, setTweetContent] = useState<string>('');
  const [userData] = useAtom(authenticatedAtom);
  const [matchingUsers, setMatchingUsers] = useState<SearchedUser[] | null>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const lastWordRef = useRef<string | undefined>(undefined);

  const fetchUsers = async (query: string): Promise<SearchedUser[]> => {
    if (query === undefined) {
      return [];
    }

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${userData?.username}/followers`,
        {
          params: { byFollowers: true, limit: 20 },
          headers: {
            Authorization: `Bearer ${userData?.token}`
          },
          timeout: 10000
        }
      );

      console.log('Fetched ', response.data.length, ' users');

      return response.data;
    } catch (error) {
      console.log(`No users: ${query}, `, error);
    }

    return [];
  };

  const handleSendTweet = () => {
    if (tweetContent.trim().length > 0) {
      onTweetSend(tweetContent);
      setTweetContent(''); // Clear the input after sending the tweet
      onClose();
    }
  };

  const handleMention = async () => {
    if (!lastWordRef.current?.startsWith('@')) {
      return;
    }

    setMatchingUsers(await fetchUsers(lastWordRef.current.slice(1)));
  };

  const handleTweetContentChange = async (target: string) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    setMatchingUsers(null);
    lastWordRef.current = target.split(/\s+/).pop();
    setTweetContent(target);
    timeout.current = setTimeout(handleMention, 400);
  };

  const setLastWordToUsername = (username: string) => {
    let contentArr = tweetContent.split(/\s+/);
    contentArr[contentArr.length - 1] = `@${username}`;
    setTweetContent(contentArr.join(' '));
  };

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Do something when the keyboard hides
      setMatchingUsers(null);
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={25}
            style={{ margin: 0 }}
            onPress={onClose}
            iconColor="rgb(255 255 255)"
          />
          <Button
            mode="contained"
            compact={true}
            buttonColor={'#1494df'}
            onPress={() => handleSendTweet()}
            style={[styles.post_button, { opacity: tweetContent.trim().length > 0 ? 1 : 0.5 }]}
            aria-disabled={true}
            labelStyle={{
              fontWeight: 'bold',
              textAlign: 'center',
              textAlignVertical: 'center',
              margin: 0
            }}
            contentStyle={{ height: 35, marginBottom: 2 }}
          >
            Post
          </Button>
        </View>
        <>
          <View style={styles.container}>
            <Image
              style={styles.profile_logo}
              source={
                userData?.profilePicture
                  ? { uri: userData?.profilePicture }
                  : default_images.default_profile_picture
              }
            />
            <TextInput
              style={styles.input}
              cursorColor="rgb(255 255 255)"
              textColor="rgb(255 255 255)"
              outlineStyle={{
                borderWidth: 0,
                backgroundColor: 'rgb(5 5 5)'
              }}
              contentStyle={{ padding: 10 }}
              mode="outlined"
              placeholder={placeholder || "What's happening?"}
              value={tweetContent}
              onPress={() => {
                if (!tweetContent) {
                  return;
                }

                if (timeout.current) {
                  clearTimeout(timeout.current);
                }

                timeout.current = setTimeout(handleMention, 400);
              }}
              onBlur={() => {
                if (timeout.current) {
                  clearTimeout(timeout.current);
                }
              }}
              onChangeText={handleTweetContentChange}
              multiline
              maxLength={280} // Limit to 280 characters like Twitter
            />
          </View>
        </>
        {matchingUsers && matchingUsers.length > 0 ? (
          <View
            style={{
              height: 64 * 4,
              borderTopWidth: 1,
              bottom: 64,
              borderTopColor: 'rgb(50 50 50)'
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
                    setLastWordToUsername(username);
                    setMatchingUsers(null);
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'flex-start',
    padding: 10,
    maxWidth: '100%'
  },
  profile_logo: {
    width: 40,
    height: 40,
    borderRadius: 200
  },
  header: {
    paddingTop: 10,
    maxHeight: 45,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  post_button: {
    paddingHorizontal: 10,
    marginRight: 11,
    paddingTop: 0
  },
  input: {
    width: '90%',
    borderWidth: 0,
    borderRadius: 10,
    padding: 0,
    margin: 0,
    paddingTop: 8,
    textAlignVertical: 'center'
  }
});

export default NewTweetInput;
