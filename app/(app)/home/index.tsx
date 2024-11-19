import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';
import { blockedAtom } from '@/atoms/blockedAtom';
import { tweetDeleteAtom } from '@/atoms/deleteTweetAtom';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import FeedRefresh, { IFeedRefreshProps } from '@/components/feed/feed_refresh';
import FeedType, { IFeedTypeProps } from '@/components/feed/feed_type';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';
import TweetCard from '@/components/twits/TweetCard';
import useAxiosInstance, { intervals } from '@/hooks/useAxios';
import { RefreshControl } from 'react-native';

const window = Dimensions.get('screen');
let newTwits: TwitSnap[] | null = null;
// const intervalMinutes = 10 * 60 * 1000;
const intervalMinutes = 30 * 1000;

export default function FeedScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const [tweets, setTweets] = useState<TwitSnap[] | null>(null);
  const newerTwitRef = useRef<TwitSnap | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const axiosTwits = useAxiosInstance('twits');
  const isBlocked = useAtomValue(blockedAtom);

  const [animatedValue] = useState(new Animated.Value(window.height));
  const [isExpanded, setIsExpanded] = useState(false);

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);
  const [needRefresh, setNeedRefresh] = useState(false);

  const [fetchDeletedTwits, setDeletedTwits] = useAtom(tweetDeleteAtom);

  const isActualFeedTypeFollowing = useRef<boolean>(false);

  const loadMoreRef = useRef<boolean>(true);

  const refreshProps: IFeedRefreshProps = {
    profileURLs: [],
    handler: () => {
      setNeedRefresh(false);

      setTweets((prev_twits) => {
        let new_twits: TwitSnap[] = [];

        if (prev_twits && newTwits) {
          new_twits = [
            ...newTwits.filter((twit) => !fetchDeletedTwits.twitId.includes(twit.id)),
            ...prev_twits
          ];
          setDeletedTwits({ shouldDelete: false, twitId: [] });
          newerTwitRef.current = new_twits[0];
          newTwits = null;
        }

        return new_twits;
      });
    }
  };

  const handlePress = () => {
    setShowTabs(!showTabs);
    Animated.timing(animatedValue, {
      toValue: isExpanded ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpanded(!isExpanded);
    });
    Keyboard.dismiss();
  };

  const resetState = () => {
    newTwits = null;
    setTweets(null);
    newerTwitRef.current = null;
    setNeedRefresh(false);
  };

  const feed: IFeedTypeProps = {
    items: [
      {
        text: 'For you',
        handler: async () => {
          resetState();
          initFeed();
          isActualFeedTypeFollowing.current = false;
          loadMoreRef.current = true;
        },
        state: true
      },
      {
        text: 'Following',
        handler: async () => {
          resetState();
          initFeed(true);
          isActualFeedTypeFollowing.current = true;
          loadMoreRef.current = true;
        },
        state: false
      }
    ]
  };

  const initFeed = async (byFollowed: boolean = false) => {
    if (tweets) {
      return;
    }

    const params = {
      rank: true,
      limit: 20,
      byFollowed: byFollowed
    };

    const fetchedTweets = await fetchTweets(params);
    newerTwitRef.current = fetchedTweets[0];
    setTweets(fetchedTweets.filter((twit) => !fetchDeletedTwits.twitId.includes(twit.id)));
    setDeletedTwits({ shouldDelete: false, twitId: [] });
  };

  const refreshTweets = async (newerTwit: TwitSnap | null): Promise<void> => {
    console.log(`refresh!`);

    const params = {
      createdAt: newerTwit ? newerTwit.createdAt : undefined,
      older: false,
      byFollowed: isActualFeedTypeFollowing.current,
      rank: true,
      limit: 100
    };

    newTwits = await fetchTweets(params);

    if (newTwits.length > 0) {
      // refreshProps.profileURLs = [...newTwits.slice(0, 2).map((twit: TwitSnap) => twit.user.profilePictureURL)],
      setNeedRefresh(true);
    }
  };

  const forceRefresh = async (newerTwit: TwitSnap | null): Promise<void> => {
    console.log(`force refresh!`);
    setRefreshing(true);
    const params = {
      createdAt: newerTwit ? newerTwit.createdAt : undefined,
      older: false,
      byFollowed: isActualFeedTypeFollowing.current,
      rank: true,
      limit: 100
    };

    newTwits = await fetchTweets(params);

    setTweets((prev_twits) => {
      let new_twits: TwitSnap[] = [];

      if (prev_twits && newTwits) {
        new_twits = [
          ...newTwits.filter((twit) => !fetchDeletedTwits.twitId.includes(twit.id)),
          ...prev_twits
        ];
        setDeletedTwits({ shouldDelete: false, twitId: [] });
        newerTwitRef.current = new_twits[0];
        newTwits = null;
      }

      return new_twits;
    });
    setRefreshing(false);
  };

  const loadMoreTwits = async () => {
    console.log('scroll refresh!');
    if (!tweets) {
      return;
    }

    const params = {
      createdAt: tweets[tweets.length - 1] ? tweets[tweets.length - 1].createdAt : undefined,
      older: true,
      limit: 20,
      byFollowed: isActualFeedTypeFollowing.current
    };

    const olderTwits: TwitSnap[] = await fetchTweets(params);

    if (olderTwits.length === 0) {
      return;
    }

    setTweets((prev_twits) => {
      if (!prev_twits) {
        return olderTwits;
      }
      const twits = [
        ...prev_twits,
        ...olderTwits.filter((twit) => !fetchDeletedTwits.twitId.includes(twit.id))
      ];
      setDeletedTwits({ shouldDelete: false, twitId: [] });
      return twits;
    });

    loadMoreRef.current = true;
  };

  const fetchTweets = async (queryParams: object | undefined = undefined): Promise<TwitSnap[]> => {
    let twits: TwitSnap[] = [];

    await axiosTwits
      .get(`snaps`, {
        params: queryParams
      })
      .then((response) => {
        console.log('Fetched: ', response.data.data.length, ' twits');
        twits = response.data.data;

        if (twits.length > 0) {
          const currentTwitsIds = tweets?.map(({ id }) => id);
          twits = twits.filter(({ id }) => !currentTwitsIds?.includes(id));
        }
      })
      .catch((error) => {
        // console.error('Error response: ', error.response);
        // console.error('Error requeest: ', error.request);
        // console.error('error config: ', error.config);
        console.error('error message: ', error.message);
      });

    return twits;
  };

  const sendTwit = async (tweetContent: string, privacySetting: string) => {
    try {
      const response = await axiosTwits.post(
        `snaps`,
        {
          user: {
            userId: userData?.id,
            name: userData?.name,
            username: userData?.username
          },
          content: tweetContent.trim(),
          privacy: privacySetting,
          type: 'original',
          parent: undefined
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Twit sent: ', response.data);
    } catch (error: any) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  useEffect(() => {
    initFeed();
  }, []);

  if (!intervals.get('fetchInterval') && tweets) {
    if (intervals.get('fetchInterval')) {
      clearInterval(intervals.get('fetchInterval'));
    }

    if (!isBlocked) {
      intervals.set(
        'fetchInterval',
        setInterval(() => refreshTweets(newerTwitRef.current), intervalMinutes)
      );
    }
  }

  return (
    <>
      <FeedType {...feed} />
      {needRefresh && <FeedRefresh {...refreshProps} />}
      <View style={styles.container}>
        <ScrollView
          scrollEventThrottle={250}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                await forceRefresh(newerTwitRef.current);
              }}
              colors={['#2196F3']} // Android
              tintColor="#2196F3" // iOS
            />
          }
          onScroll={({ nativeEvent }) => {
            if (!loadMoreRef.current) {
              return;
            }
            // User has reached the bottom?
            if (
              nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
              nativeEvent.contentSize.height * 0.8
            ) {
              loadMoreRef.current = false;
              loadMoreTwits();
            }
          }}
          contentContainerStyle={{
            justifyContent: 'center'
          }}
        >
          {tweets ? (
            tweets.length === 0 ? (
              <Text
                style={{
                  color: 'rgb(255 255 255)',
                  textAlign: 'center',
                  alignContent: 'center',
                  fontSize: 35
                }}
              >
                Oops! Looks like no one has twited before. Twit something using{'\n'}
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
              <FlatList<TwitSnap>
                data={tweets}
                renderItem={({ item }) => {
                  return <TweetCard item={item} />;
                }}
                keyExtractor={(item) => item.id}
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
            paddingTop: 35,
            width: window.width
          },
          {
            transform: [{ translateY: animatedValue }],
            bottom: 0
          }
        ]}
      >
        <View style={{ height: window.height }}>
          <TweetBoxFeed
            onTweetSend={(tweetContent, tweetPrivacy) => {
              sendTwit(tweetContent, tweetPrivacy);
            }}
            onClose={handlePress}
          />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgb(5 5 5)'
  }
});
