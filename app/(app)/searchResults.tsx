import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { TwitSnap } from '@/app/types/TwitSnap';
import LargeUserCard from '@/components/search/largeUserCard';
import ResultSearchBar from '@/components/search/resultSearchBar';
import TweetCard from '@/components/twits/TweetCard';
import useAxiosInstance from '@/hooks/useAxios';
import removeDuplicates from '@/utils/removeDup';

import { SearchedUser } from '../types/publicUser';

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
  const [tweets, setTweets] = useState<TwitSnap[] | null>(null);
  const [users, setUsers] = useState<SearchedUser[] | null>(null);
  const axiosUsers = useAxiosInstance('users');
  const axiosTwits = useAxiosInstance('twits');

  useFocusEffect(
    useCallback(() => {
      setTweets(null);
      setUsers(null);
      const fetchByHashtag = async (): Promise<TwitSnap[]> => {
        try {
          const response = await axiosTwits.get(`snaps`, {
            params: { has: query }
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
          const response = await axiosTwits.get(`snaps`, {
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

      const fetchUsers = async (): Promise<SearchedUser[]> => {
        try {
          const response = await axiosUsers.get(`users`, {
            params: { has: query, limit: 20 }
          });
          console.log('Fetched ', response.data.length, ' users');

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
        const fetchedUsers = await fetchUsers();

        setUsers(fetchedUsers);
        setTweets([...twits]);
      };

      fetchTweets();

      return () => {
        setTweets(null);
        setUsers(null);
      };
    }, [query])
  );

  const clearTweets = () => {
    setTweets(null);
    setUsers(null);
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 50 }}>
        <ResultSearchBar clearHandler={clearTweets} previousQuery={query} />
      </View>
      {tweets && users ? (
        <>
          {users.length > 0 && (
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
          )}
          {tweets.length > 0 && (
            <FlatList
              data={tweets}
              renderItem={({ item }) => <TweetCard item={item} />}
              keyExtractor={(item) => item.id}
            />
          )}
          {(tweets.length | users.length) === 0 && (
            <View style={styles.error_container}>
              <Text
                numberOfLines={6}
                ellipsizeMode="tail"
                style={styles.error_label}
              >{`No results for "${query}"`}</Text>
              <Text style={styles.error_label_aux}>Try searching for something else</Text>
            </View>
          )}
        </>
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
