import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';
import { feedRefreshIntervalAtom } from '@/atoms/feedRefreshInterval';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import FeedRefresh, { IFeedRefreshProps } from '@/components/feed/feed_refresh';
import FeedType, { IFeedTypeProps } from '@/components/feed/feed_type';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';
import TweetCard from '@/components/twits/TweetCard';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
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

const axios = require('axios').default;
const window = Dimensions.get('screen');
const intervalMinutes = 10 * 60 * 1000;

export default function FeedScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const [tweets, setTweets] = useState<TwitSnap[] | null>(null);

  const [animatedValue, setAnimatedValue] = useState(new Animated.Value(window.height));
  const [isExpanded, setIsExpanded] = useState(false);

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);
  const [needRefresh, setNeedRefresh] = useState(false);

  const [fetchInterval, setFetchInterval] = useAtom(feedRefreshIntervalAtom);


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
        handler: () => {},
        state: true
      },
      {
        text: 'Following',
        handler: () => {},
        state: false
      }
    ]
  };

  useEffect(() => {
    const loadTweets = async () => {
      const fetchedTweets = await fetchTweets();
      setTweets(fetchedTweets);
    };
    loadTweets();
  }, []);

  const fetchTweets = async (
    queryParams: object | undefined = undefined,
    url: string = ''
  ): Promise<TwitSnap[]> => {
    let tweets: TwitSnap[] = [];
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps/${url}`, {
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
          headers: { 'Content-Type': 'application/json' }
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
    return () => {
      // Anything in here is fired on component unmount.
      if (fetchInterval) {
        clearInterval(fetchInterval);
      }
    };
  }, [fetchInterval]);

  if (!fetchInterval && tweets) {
    setFetchInterval(setInterval(refreshTweets, intervalMinutes));
  }

  return (
    <>
      <FeedType {...feed} />
      {needRefresh && <FeedRefresh {...refreshProps} />}
      <View style={styles.container}>
        <ScrollView
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
                  return (
                    <TweetCard
                      profileImage={''}
                      name={item.user.name}
                      username={item.user.username}
                      content={item.content}
                      date={item.createdAt}
                    />
                  );
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
