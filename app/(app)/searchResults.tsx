import { router, useLocalSearchParams } from 'expo-router';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Appbar } from 'react-native-paper';

import { TwitSnap, TwitUser } from '@/app/types/TwitSnap';
import TweetCard from '@/components/twits/TweetCard';
import removeDuplicates from '@/utils/removeDup';

import { authenticatedAtom } from '../authAtoms/authAtom';

const axios = require('axios').default;
const window = Dimensions.get('window');
const parseQuery = (query: string): string => {
  query = query.trim();

  if (query[0] === '#') {
    return query.substring(1);
  }

  return query;
};

export default function SearchResultsScreen() {
  const query = parseQuery(useLocalSearchParams<{ query: string }>().query);
  const userData = useAtomValue(authenticatedAtom);
  const [tweets, setTweets] = useState<TwitSnap[] | null>(null);

  useEffect(() => {
    const fetchByHashtag = async (): Promise<TwitSnap[]> => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps`, {
          headers: { Authorization: `Bearer ${userData?.token}` },
          params: { hashtag: query }
        });

        console.log(`Fetched ${response.data.data.length} twits with "#${query}"`);

        return response.data.data;
      } catch (error) {
        console.log(`No twits with hashtag ${query}, `, error);
      }

      return [];
    };

    const fetchByText = async (): Promise<TwitSnap[]> => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps`, {
          headers: { Authorization: `Bearer ${userData?.token}` },
          params: { has: query }
        });

        console.log(
          `Fetched ${response.data.data.length} twits which has "${query}" in its content`
        );

        return response.data.data;
      } catch (error) {
        console.log(`No twit has in its content: ${query}, `, error);
      }

      return [];
    };

    const fetchUsers = async (): Promise<TwitUser[]> => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_USER_SERVICE_URL}`, {
          headers: { Authorization: `Bearer ${userData?.token}` },
          params: undefined
        });
        return response.data.data;
      } catch (error) {
        console.log(`No users: ${query}, `, error);
      }

      return [];
    };

    const fetchTweets = async () => {
      const hashtagTwits = await fetchByHashtag();
      const textTwits = await fetchByText();
      // const users = await fetchUsers();

      const twits = removeDuplicates([...hashtagTwits, ...textTwits]);

      setTweets([...twits]);
    };

    fetchTweets();
  }, [query, userData?.token]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: 'rgb(5 5 5)' }}>
        <Appbar.BackAction onPress={() => router.push('/home')} color="rgb(255 255 255)" />
      </Appbar.Header>
      <Text style={styles.header}> Tweets with {query} </Text>
      {tweets ? (
        tweets.length > 0 ? (
          <FlatList
            data={tweets}
            renderItem={({ item }) => <TweetCard item={item} />}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View style={styles.error_container}>
            <Text
              numberOfLines={6}
              ellipsizeMode="tail"
              style={styles.error_label}
            >{`No results for "${query}"`}</Text>
            <Text style={styles.error_label_aux}>Try searching for something else</Text>
          </View>
        )
      ) : (
        <ActivityIndicator
          animating={true}
          color={'rgb(3, 165, 252)'}
          size={60}
          style={{ alignSelf: 'center' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)',
    marginTop: StatusBar.currentHeight ? -StatusBar.currentHeight : 0,
    paddingHorizontal: 2
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'rgb(255 255 255)'
  },
  error_label: {
    color: 'rgb(255 255 255)',
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'left',
    textAlignVertical: 'center',
    width: '100%'
  },
  error_label_aux: {
    color: 'rgb(120 120 120)',
    fontSize: 16,
    alignSelf: 'center',
    textAlign: 'left',
    textAlignVertical: 'center',
    width: '100%',
    marginTop: 3
  },
  error_container: {
    justifyContent: 'center',
    alignContent: 'center',
    flex: 1,
    height: '100%',
    maxWidth: window.width,
    flexDirection: 'column',
    marginHorizontal: 25
  }
});
