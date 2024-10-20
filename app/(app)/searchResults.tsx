import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAtomValue } from 'jotai';
import React, { useCallback, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { TwitSnap } from '@/app/types/TwitSnap';
import TweetCard from '@/components/twits/TweetCard';
import removeDuplicates from '@/utils/removeDup';

import LargeUserCard from '@/components/search/largeUserCard';
import ResultSearchBar from '@/components/search/resultSearchBar';
import { authenticatedAtom } from '../authAtoms/authAtom';
import { SearchedUser } from '../types/publicUser';

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
  const [users, setUsers] = useState<SearchedUser[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      setTweets(null);
      setUsers(null);
      const fetchByHashtag = async (): Promise<TwitSnap[]> => {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps`, {
            headers: { Authorization: `Bearer ${userData?.token}` },
            params: { has: query },
            timeout: 10000
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
            params: { has: query },
            timeout: 10000
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

      const fetchUsers = async (): Promise<SearchedUser[]> => {
        try {
          const response = await axios.get(`${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users`, {
            headers: { Authorization: `Bearer ${userData?.token}` },
            params: { has: query },
            timeout: 10000
          });
          return response.data;
        } catch (error) {
          console.log(`No users: ${query}, `, error);
        }

        return [];
      };

      const fetchTweets = async () => {
        const hashtagTwits = await fetchByHashtag();
        const textTwits = await fetchByText();

        const twits = removeDuplicates([...hashtagTwits, ...textTwits]);

        setUsers(await fetchUsers());
        setTweets([...twits]);
      };

      fetchTweets();

      return () => {
        setTweets(null);
        setUsers(null);
      };
    }, [query, userData?.token])
  );

  const clearTweets = () => {
    setTweets(null);
    setUsers(null);
  };

  return (
    <View style={styles.container}>
      <ResultSearchBar clearHandler={clearTweets} previousQuery={query} />
      {tweets && users ? (
        // true || users.length > 0 ? (
        (
          <View
            style={{
              paddingHorizontal: 10,
              paddingTop: 10,
              borderWidth: 1,
              borderBottomColor: 'rgb(40 40 40)'
            }}
          >
            <Text style={{ color: 'rgb(255 255 255)', fontSize: 20, fontWeight: '600' }}>
              People
            </Text>
            <FlatList
              style={{ paddingVertical: 10 }}
              horizontal={true}
              data={users}
              renderItem={({ item }) => <LargeUserCard item={item} />}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        )
      ) : (
        <></>
      )}

      {tweets && users ? (
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
    paddingHorizontal: 2
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
