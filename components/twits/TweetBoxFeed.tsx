import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Pressable,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Button, Divider, IconButton, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Entypo';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { SearchedUser } from '@/app/types/publicUser';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import useAxiosInstance from '@/hooks/useAxios';

import UserCard from '../profile/userCard';

const window = Dimensions.get('screen');

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface NewTweetInputProps {
  onTweetSend: (tweetContent: string, tweetPrivacy: string) => void;
  onClose: () => void;
  placeholder?: string;
  baseContent?: string;
}

const NewTweetInput: React.FC<NewTweetInputProps> = ({
  onTweetSend,
  onClose,
  placeholder,
  baseContent
}) => {
  const [tweetContent, setTweetContent] = useState<string>(baseContent || '');
  const [userData] = useAtom(authenticatedAtom);
  const [showTabs, setShowTabs] = useAtom(showTabsAtom);
  const [matchingUsers, setMatchingUsers] = useState<SearchedUser[] | null>(null);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const lastWordRef = useRef<string | undefined>(undefined);
  const axiosUsers = useAxiosInstance('users');
  const [animatedPrivacy] = useState(new Animated.Value(window.height));

  const fetchUsers = async (query: string): Promise<SearchedUser[]> => {
    if (query === undefined) {
      return [];
    }

    try {
      const response = await axiosUsers.get(`users/${userData?.username}/followers`, {
        params: { byFollowers: true, limit: 20, has: query }
      });

      console.log('Fetched ', response.data.length, ' users');

      return response.data;
    } catch (error) {
      console.log(`No users: ${query}, `, error);
    }

    return [];
  };

  const handleSendTweet = () => {
    if (tweetContent.trim().length > 0) {
      onTweetSend(tweetContent, mapVisibility[visibility]);
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
    const contentArr = tweetContent.split(/\s+/);
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

  const [visibility, setVisibility] = useState('Everyone can reply');
  const [isPrivacyMenuVisible, setPrivacyMenuVisibility] = useState(false);

  const handlePrivacyMenu = () => {
    setShowTabs(!showTabs);
    Animated.timing(animatedPrivacy, {
      toValue: isPrivacyMenuVisible ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setPrivacyMenuVisibility(!isPrivacyMenuVisible);
    });
    Keyboard.dismiss();
  };

  const mapVisibility: { [key: string]: string } = {
    'Everyone can reply': 'Everyone',
    'Only Followers': 'Only Followers'
  };

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
          <View style={{ backgroundColor: 'rgb(5 5 5)', padding: 10 }}>
            <View style={styles.textContainer}>
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
            <View style={{ position: 'absolute', right: 0, left: 0, marginVertical: 45 }}>
              <Pressable onPress={handlePrivacyMenu} style={styles.visibilityButton}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton
                    icon={visibility === 'Everyone can reply' ? 'earth' : 'lock'}
                    size={20}
                    iconColor="#1DA1F2"
                  />
                  <Text style={styles.visibilityText}>{visibility}</Text>
                </View>
              </Pressable>
            </View>
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
      <Animated.View
        style={[
          {
            backgroundColor: 'rgb(5 5 5)',
            zIndex: 50,
            position: 'absolute',
            bottom: 0,
            top: 0,
            paddingTop: 35,
            width: window.width
          },
          {
            transform: [{ translateY: animatedPrivacy }],
            top: '20%'
          }
        ]}
      >
        <View style={{ borderRadius: 30 }}>
          <Divider
            style={{
              height: 2,
              width: '30%',
              backgroundColor: 'rgb(194,187,187)',
              marginLeft: '35%',
              marginRight: '35%'
            }}
          />
          <View style={styles.menu}>
            <IconButton
              icon="close"
              size={25}
              style={{ margin: 0 }}
              onPress={handlePrivacyMenu}
              iconColor="rgb(255 255 255)"
            />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisibility('Everyone can reply');
                handlePrivacyMenu();
              }}
            >
              <Icon name="globe" size={20} color="#1DA1F2" />
              <Text style={styles.menuText}>Everyone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setVisibility('Only Followers');
                handlePrivacyMenu();
              }}
            >
              <Icon name="lock" size={20} color="#1DA1F2" />
              <Text style={styles.menuText}>Only Followers</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  textContainer: {
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
  },
  visibilityButton: {
    padding: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    marginVertical: 120,
    width: '100%'
  },
  visibilityText: {
    color: '#1DA1F2', // Twitter blue color
    fontWeight: 'bold'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end', // Align modal at the bottom
    alignItems: 'center',
    position: 'absolute',
    width: '100%'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  optionText: {
    fontSize: 18,
    padding: 10
  },
  modalContainer: {
    position: 'absolute',
    top: 50,
    right: 0,
    left: 0,
    backgroundColor: 'black',
    borderRadius: 8,
    padding: 10,
    elevation: 5
  },
  menu: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 10
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8
  },
  menuText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'white'
  }
});

export default NewTweetInput;
