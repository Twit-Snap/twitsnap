import axios from 'axios';
import { parseISO } from 'date-fns';
import { useRouter, useSegments } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useAtom } from 'jotai/index';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Divider, IconButton } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';
import { tweetDeleteAtom } from '@/atoms/deleteTweetAtom';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import ThreeDotMenu from '@/components/twits/ThreeDotMenu';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';

import Interaction, { handlerReturn } from './interaction';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface TweetCardProps {
  item: TwitSnap;
}

const window = Dimensions.get('screen');

const InspectTweetCard: React.FC<TweetCardProps> = ({ item }) => {
  const userData = useAtomValue(authenticatedAtom);
  const router = useRouter(); // Obtener el objeto de router
  const segments = useSegments(); // Obtener la ruta actual

  const [animatedValueComment] = useState(new Animated.Value(window.height));
  const [animatedValueThreeDot] = useState(new Animated.Value(window.height));

  const [isExpandedComment, setIsExpandedComment] = useState(false);
  const isExpandedCommentRef = useRef(false);

  const [isExpandedThreeDot, setIsExpandedThreeDot] = useState(false);
  const isExpandedRefThreeDot = useRef(false);

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);
  const [tweetDelete, setTweetDelete] = useAtom(tweetDeleteAtom);

  const formatDate = (dateString: string): string => {
    const date = parseISO(dateString);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = date.toISOString().split('T')[0];
    return `${time} | ${formattedDate}`;
  };

  const renderContent = (text: string) => {
    const words = text.split(' ');
    return (
      <Text>
        {words.map((word, index) => {
          if (word.startsWith('#')) {
            return (
              <Text key={index}>
                <Text
                  onPress={() =>
                    router.push({
                      pathname: `/searchResults`,
                      params: { query: word }
                    })
                  }
                  style={styles.hashtag}
                >
                  {word}
                </Text>{' '}
              </Text>
            );
          }
          return <Text key={index}>{word} </Text>;
        })}
      </Text>
    );
  };

  const handlePressComment = () => {
    setShowTabs(!showTabs);
    Animated.timing(animatedValueComment, {
      toValue: isExpandedComment ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpandedComment(!isExpandedComment);
    });
    Keyboard.dismiss();
  };

  const handlePressThreeDot = () => {
    setShowTabs(!showTabs);
    Animated.timing(animatedValueThreeDot, {
      toValue: isExpandedThreeDot ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpandedThreeDot(!isExpandedThreeDot);
    });
    Keyboard.dismiss();
  };

  const onTwitDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps/${item.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData?.token}`
          },
          timeout: 10000
        }
      );
      if (response.status === 204) {
        setTweetDelete({ shouldDelete: true, twitId: [...tweetDelete.twitId, item.id] });
        router.back();
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  const onTwitEdit = async () => {
    try {
      const response = await axios.patch(
        `${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps/${item.id}`,
        {
          content: 'Edited content'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData?.token}`
          },
          timeout: 10000
        }
      );
      if (response.status === 204) {
        console.log('Successfully edited the tweet with id: ', item.id);
        router.back();
      }
    } catch (error) {
      console.error('Error editing tweet:', error);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={router.back} style={[styles.goBack, { marginTop: -28 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="arrow-left" iconColor="rgb(255 255 255)" size={24} />
          <Text style={{ color: 'rgb(255 255 255)', fontSize: 20, marginLeft: 5 }}>Post</Text>
        </View>
        <Divider style={{ height: 1, width: '100%', backgroundColor: 'rgb(194,187,187)' }} />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '../profile/[username]',
              params: { username: item.user.username }
            })
          }
        >
          <Image
            source={
              item.profileImage
                ? { uri: item.profileImage }
                : default_images.default_profile_picture
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <Text style={styles.name}>{item.user.name}</Text>
            <Text style={styles.username}>@{item.user.username}</Text>
          </View>
          <IconButton
            icon="dots-horizontal"
            style={{ position: 'absolute', left: window.width - 120 }}
            size={24}
            onPress={() => {
              isExpandedRefThreeDot.current = !isExpandedRefThreeDot.current;
              setIsExpandedThreeDot(isExpandedRefThreeDot.current);
              handlePressThreeDot();
            }}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'column' }}>
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{renderContent(item.content)}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Interaction
            icon="comment-outline"
            initState={false}
            initCount={1_023_203}
            handler={async (state: boolean, count: number): Promise<handlerReturn> => {
              isExpandedCommentRef.current = !isExpandedCommentRef.current;
              setIsExpandedComment(isExpandedCommentRef.current);
              handlePressComment();
              return { state: true, count: 0 };
            }}
          />
          <Interaction
            icon="repeat-off"
            icon_alt="repeat"
            icon_alt_color="rgb(47, 204, 110  )"
            initState={false}
            initCount={1_023_203}
            handler={async (state: boolean, count: number): Promise<handlerReturn> => {
              console.log('asd');
              return { state: true, count: 0 };
            }}
          />
          <Interaction
            icon="heart-outline"
            icon_alt="heart"
            icon_alt_color="rgb(255, 79, 56)"
            initState={item.userLiked}
            initCount={item.likesCount}
            handler={async (state: boolean, count: number): Promise<handlerReturn> => {
              return state
                ? {
                    state: await axios
                      .delete(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}likes`, {
                        data: {
                          twitId: item.id
                        },
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${userData?.token}`
                        }
                      })
                      .then(() => !state)
                      .catch((error) => {
                        console.error(error);
                        return state;
                      }),
                    count: count - 1
                  }
                : {
                    state: await axios
                      .post(
                        `${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}likes`,
                        {
                          twitId: item.id
                        },
                        {
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${userData?.token}`
                          }
                        }
                      )
                      .then(() => !state)
                      .catch((error) => {
                        console.error(error);
                        return state;
                      }),
                    count: count + 1
                  };
            }}
          />
        </View>
        <Text style={[styles.date]}>{formatDate(item.createdAt)}</Text>
      </View>
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
            transform: [{ translateY: animatedValueComment }],
            bottom: 0
          }
        ]}
      >
        <View style={{ height: window.height }}>
          <TweetBoxFeed
            onTweetSend={(tweetContent) => {
              console.log('tweetContent: ', tweetContent);
            }}
            onClose={handlePressComment}
            placeholder={`Replying to @${item.user.username}`}
          />
        </View>
      </Animated.View>
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
            transform: [{ translateY: animatedValueThreeDot }],
            top: '30%'
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
          <ThreeDotMenu
            onClose={handlePressThreeDot}
            onTwitDelete={onTwitDelete}
            onTwitEdit={onTwitEdit}
            twitIsFromUser={item.user.username === userData?.username}
          />
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(25 25 25)',
    backgroundColor: 'rgb(5 5 5)'
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10
  },
  contentContainer: {
    marginLeft: 10
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgb(255 255 255)'
  },
  username: {
    fontWeight: 'light',
    color: 'rgb(120 120 120)',
    fontSize: 14
  },
  content: {
    fontSize: 18,
    paddingVertical: 5,
    color: 'rgb(220 220 220)'
  },
  date: {
    fontSize: 14,
    color: 'rgb(120 120 120)',
    marginLeft: 10,
    marginTop: 5
  },
  hashtag: {
    color: 'rgb(67,67,244)'
  },
  dot: {
    fontSize: 16,
    color: 'rgb(120 120 120)'
  },
  interaction_icon: {
    margin: 0
  },
  interaction_label: {
    color: 'rgb(120 120 120)',
    textAlign: 'left',
    textAlignVertical: 'bottom',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 14,
    height: 36
  },
  goBack: {
    paddingRight: 9,
    paddingTop: -10
  }
});

export default InspectTweetCard;
