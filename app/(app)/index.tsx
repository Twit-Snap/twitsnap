import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { FlatList, View, ScrollView, StyleSheet, Image } from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';

import TweetCard from '../../components/twits/TweetCard';

const axios = require('axios').default;

const feed_images = {
  logo: require('../../assets/images/logo_light.png')
};

const TwitsInFeed: TwitSnap[] = [];

export default function FeedScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const [tweets, setTweets] = useState<TwitSnap[]>(TwitsInFeed);

  useEffect(() => {
    const loadTweets = async () => {
      const fetchedTweets = await fetchTweets();
      setTweets(fetchedTweets);
    };
    loadTweets();
  }, []);

  const fetchTweets = async (): Promise<TwitSnap[]> => {
    let tweets: TwitSnap[] = [];
    try {
      const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps`);
      tweets = response.data.data;
      console.log('Tweets fetched: ', tweets);
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

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.logoContainer}>
          <Image source={feed_images.logo} style={styles.logo} resizeMode="contain" />
        </View>
        <TweetBoxFeed
          onTweetSend={(tweetContent) => {
            sendTwit(tweetContent);
          }}
        />
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 150,
    height: 50
  }
});
