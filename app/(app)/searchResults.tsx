import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Appbar } from 'react-native-paper';

import { TwitSnap } from '@/app/types/TwitSnap';
import TweetCard from '@/components/twits/TweetCard';

const axios = require('axios').default;

export default function SearchResultsScreen() {
  const { hashtag } = useLocalSearchParams<{ hashtag: string }>();
  const [tweets, setTweets] = useState<TwitSnap[]>([]);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}hashtags/${hashtag.substring(1)}`
        );
        setTweets(response.data.data);
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    if (hashtag) {
      fetchTweets();
    }
  }, [hashtag]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: 'rgb(0 0 0)' }}>
        <Appbar.BackAction onPress={() => router.push('/home')} color="rgb(255 255 255)" />
      </Appbar.Header>
      <Text style={styles.header}> Tweets with {hashtag} </Text>
      <FlatList
        data={tweets}
        renderItem={({ item }) => (
          <TweetCard
            profileImage={''}
            name={item.user.name}
            username={item.user.username}
            content={item.content}
            date={item.createdAt}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgb(5 5 5)'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'rgb(255 255 255)'
  }
});
