import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { ErrorUser, SearchedUser } from '@/app/types/publicUser';
import { TwitSnap } from '@/app/types/TwitSnap';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TweetCard from '@/components/twits/TweetCard';

import useAxiosInstance from '@/hooks/useAxios';
import { authenticatedAtom } from '../../authAtoms/authAtom';

export default function PublicProfileScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const { username } = useLocalSearchParams<{ username: string }>();

  const [searchUserData, setSearchUserData] = useState<SearchedUser | ErrorUser | null>(null);
  const [twits, setTwits] = useState<TwitSnap[] | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTwits, setHasMoreTwits] = useState(true);
  const axiosUsers = useAxiosInstance('users');
  const axiosTwits = useAxiosInstance('twits');

  // Cargar la información del usuario una sola vez
  const fetchUserData = useCallback(
    async (token: string) => {
      try {
        console.log('fetchUserData', username);
        const response = await axiosUsers.get(`users/${username}`);
        setSearchUserData(response.data.data);
      } catch (error: any) {
        if (error.status === 404) {
          setSearchUserData({
            name: 'This account does not exist!',
            username: username,
            description: 'Please try another search'
          });
        } else {
          setSearchUserData({
            name: 'Something went wrong!',
            username: username,
            description: 'Please try again later'
          });
        }
      }
    },
    [username]
  );

  // Cargar tweets, con soporte de paginación
  const fetchTweets = useCallback(
    async (olderTwits = false) => {
      if (!hasMoreTwits || !username) return;

      const lastTwit = twits ? (olderTwits ? twits[twits.length - 1] : undefined) : undefined;
      const queryParams = lastTwit
        ? { createdAt: lastTwit.createdAt, older: true, limit: 20, username: username }
        : { limit: 20, username: username };

      try {
        setLoadingMore(true);

        const response = await axiosTwits.get(`snaps/`, {
          params: queryParams
        });
        const newTwits = response.data.data;

        if (newTwits.length === 0) {
          setHasMoreTwits(false);
        } else {
          setTwits((prevTwits) => {
            if (!prevTwits) return newTwits;

            return [...prevTwits, ...newTwits];
          });
        }
      } catch (error) {
        console.error('Error fetching tweets:', error);
      } finally {
        setLoadingMore(false);
      }
    },
    [hasMoreTwits, twits, username]
  );

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!userData || !userData.token) {
          return;
        }

        setTwits(null);
        setHasMoreTwits(true);
        await fetchUserData(userData.token);
        await fetchTweets();
      };

      fetchData();

      return () => {
        setSearchUserData(null);
        setTwits(null);
      };
    }, [fetchUserData, userData])
  );

  const handleScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { nativeEvent } = event;
    if (
      nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
        nativeEvent.contentSize.height - 20 &&
      !loadingMore
    ) {
      await fetchTweets(true);
    }
  };

  if (!searchUserData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollViewContent}
      >
        <>
          <ProfileHeader user={searchUserData as SearchedUser} />
          <View style={styles.divider} />
        </>

        {twits ? (
          twits.length > 0 ? (
            twits.map((twit) => <TweetCard item={twit} key={twit.id} />)
          ) : (
            <Text style={styles.noTwitsText}>No tweets available</Text>
          )
        ) : (
          <></>
        )}
        {loadingMore && <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)'
  },
  scrollViewContent: {
    justifyContent: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(5 5 5)'
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginTop: 10
  },
  noTwitsText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40
  }
});
