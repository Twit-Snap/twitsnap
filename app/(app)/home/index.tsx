import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';
import { feedRefreshIntervalAtom } from '@/atoms/feedRefreshInterval';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import FeedRefresh, { IFeedRefreshProps } from '@/components/feed/feed_refresh';
import FeedType, { IFeedTypeProps } from '@/components/feed/feed_type';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';
import TweetCard from '@/components/twits/TweetCard';
import { useAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Dimensions,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';

const axios = require('axios').default;
const window = Dimensions.get('screen');
var newTwits: TwitSnap[] | null = null;
// const intervalMinutes = 10 * 60 * 1000;
const intervalMinutes = 10 * 1000;

export default function FeedScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const [tweets, setTweets] = useState<TwitSnap[] | null>(null);
  const twitsRef = useRef<TwitSnap[]>([]);

  const [animatedValue, setAnimatedValue] = useState(new Animated.Value(window.height));
  const [isExpanded, setIsExpanded] = useState(false);

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);
  const [needRefresh, setNeedRefresh] = useState(false);

  const [fetchInterval, setFetchInterval] = useAtom(feedRefreshIntervalAtom);

  const actualFeedType = useRef<string>('For you');

  var refreshProps: IFeedRefreshProps = {
    profileURLs: [],
    handler: () => {
      setNeedRefresh(false);

      setTweets((prev_twits) => {
        var new_twits: TwitSnap[] = [];

        if (prev_twits && newTwits) {
          new_twits = [...newTwits, ...prev_twits];
          twitsRef.current = new_twits;
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
    }).start(({ finished }) => {
      setIsExpanded(!isExpanded);
    });
    Keyboard.dismiss();
  };

  const feed: IFeedTypeProps = {
    items: [
      {
        text: 'For you',
        handler: async (twits: TwitSnap[] | null, feedType: string) => {
          initFeed();
          actualFeedType.current = 'For you';
        },
        state: true
      },
      {
        text: 'Following',
        handler: async (twits: TwitSnap[] | null, feedType: string) => {
          initFollowsFeed();
          actualFeedType.current = 'Following';
        },
        state: false
      }
    ],
    twits: twitsRef.current,
    feedType: actualFeedType.current
  };

  const initFeed = async () => {
    if (tweets) {
      return;
    }

    const params = {
      limit: 20
    };

    const fetchedTweets = await fetchTweets(params);
    twitsRef.current = fetchedTweets;
    console.log(fetchedTweets);
    setTweets(fetchedTweets);
  };

  const initFollowsFeed = async () => {
    if (tweets) {
      return;
    }

    const params = {
      limit: 20
    };

    // const fetchedTweets = await fetchTweets(params, 'by_users');
    // setTweets(fetchedTweets);
    // twitsRef.current = fetchedTweets;
    setTweets([]);
  };

  const refreshTweets = async (twits: TwitSnap[], force: boolean = false): Promise<void> => {
    console.log(`refresh!`);
    if (!twits && !force) {
      return;
    }

    console.log(twits.length);
    console.log(twits[0] ? twits[0].content : undefined);

    const params = {
      createdAt: twits[0] ? twits[0].createdAt : undefined,
      older: false,
      limit: 100
    };

    newTwits = await fetchTweets(params, actualFeedType.current === 'Following' ? 'by_users' : '');
    if (newTwits.length > 0) {
      // refreshProps.profileURLs = [...newTwits.slice(0, 2).map((twit: TwitSnap) => twit.user.profileImageURL)],
      setNeedRefresh(true);
    }
  };

  const loadMoreTwits = async () => {
    if (!tweets) {
      return;
    }

    console.log('por alguna razon entre aca');

    const params = {
      createdAt: tweets[tweets.length - 1] ? tweets[tweets.length - 1].createdAt : undefined,
      older: true,
      limit: 20
    };

    const olderTwits: TwitSnap[] = await fetchTweets(
      params,
      actualFeedType.current === 'Following' ? 'by_users' : ''
    );

    if (olderTwits.length === 0) {
      return;
    }

    setTweets((prev_twits) => {
      if (!prev_twits) {
        return olderTwits;
      }
      const ret = [...prev_twits, ...olderTwits];
      twitsRef.current = ret;
      return ret;
    });
  };

  const fetchTweets = async (
    queryParams: object | undefined = undefined,
    url: string = ''
  ): Promise<TwitSnap[]> => {
    let tweets: TwitSnap[] = [];
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps/${url}`, {
        headers: { Authorization: `Bearer ${userData?.token}` },
        params: queryParams
      });
      tweets = response.data.data;
      console.log('Fetched: ', tweets.length, ' twits');
    } catch (error: any) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
    return tweets;
  };

  const sendTwit = async (tweetContent: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps`,
        {
          authorId: userData?.id,
          authorName: userData?.name,
          authorUsername: userData?.username,
          content: tweetContent
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userData?.token}`
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
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        console.log('App will go into ', nextAppState, ' state and save current tweets');
      }
    });
    initFeed();

    return () => {
      // Anything in here is fired on component unmount.
      if (fetchInterval) {
        clearInterval(fetchInterval);
      }
      subscription.remove();
    };
  }, [fetchInterval]);

  if (!fetchInterval && tweets) {
    setFetchInterval(setInterval(() => refreshTweets(twitsRef.current), intervalMinutes));
  }

  return (
    <>
      <FeedType {...feed} />
      {needRefresh && <FeedRefresh {...refreshProps} />}
      <View style={styles.container}>
        <ScrollView
          scrollEventThrottle={16}
          onScroll={({ nativeEvent }) => {
            // User has reached the bottom?
            if (
              nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
              nativeEvent.contentSize.height
            ) {
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
          top: window.height * 0.83,
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
            onTweetSend={(tweetContent) => {
              sendTwit(tweetContent);
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
