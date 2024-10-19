import axios from 'axios';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter, useSegments } from 'expo-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';

import Interaction, { handlerReturn } from './interaction';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface TweetCardProps {
  item: TwitSnap;
}

const TweetCard: React.FC<TweetCardProps> = ({ item }) => {
  const userData = useAtomValue(authenticatedAtom);
  const router = useRouter(); // Obtener el objeto de router
  const segments = useSegments(); // Obtener la ruta actual

  const formatDate = (dateString: string): string => {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours > 24) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
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
                    router.push({ pathname: `/searchResults`, params: { hashtag: word } })
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

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.4}>
      <>
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
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={styles.contentContainer}>
            <Text style={styles.name}>
              {item.user.name}{' '}
              <Text style={styles.username}>
                @{item.user.username}
                <Text style={styles.dot}>{' - '}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </Text>
            </Text>
            <Text style={styles.content}>{renderContent(item.content)}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', maxHeight: 25 }}>
            <Interaction
              icon="comment-outline"
              initState={false}
              initCount={1_023_002_230}
              handler={async (state: boolean, count: number): Promise<handlerReturn> => {
                console.log('asd');
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
        </View>
      </>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(50 50 50)',
    backgroundColor: 'rgb(5 5 5)'
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25
  },
  contentContainer: {
    flex: 1,
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
    fontSize: 14,
    color: 'rgb(220 220 220)'
  },
  date: {
    fontSize: 12,
    color: 'rgb(120 120 120)'
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
  }
});

export default TweetCard;
