import axios from 'axios';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';

import { SearchedUser } from '@/app/types/publicUser';
import { TwitSnap } from '@/app/types/TwitSnap';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TweetCard from '@/components/twits/TweetCard';

import { authenticatedAtom } from '../authAtoms/authAtom';

export default function PublicProfileScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const { username } = useLocalSearchParams<{ username: string }>();

  const [searchUserData, setSearchUserData] = useState<SearchedUser | null>(null);
  const [twits, setTwits] = useState<TwitSnap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTwits, setHasMoreTwits] = useState(true);

  // Cargar la información del usuario una sola vez
  const fetchUserData = useCallback(
    async (token: string) => {
      try {
        setError(null);
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSearchUserData(response.data.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setError('User not found.');
        } else {
          setError('An error occurred while fetching user data.');
        }
      }
    },
    [username]
  );

  // Cargar tweets, con soporte de paginación
  const fetchTweets = useCallback(
    async (olderTwits = false) => {
      console.log('Fetching tweets before if...');
      if (!hasMoreTwits || !username) return;
      console.log('Fetching tweets for:', username);
      const lastTwit = olderTwits ? twits[twits.length - 1] : undefined;
      console.log('Last tweet to paginate from:', lastTwit);
      const queryParams = lastTwit
        ? { createdAt: lastTwit.createdAt, older: true, limit: 5 }
        : { limit: 5 };

      try {
        setLoadingMore(true);

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps/by_username/${username}`,
          { params: queryParams }
        );
        const newTwits = response.data.data;
        console.log('New tweets:', newTwits);
        console.log('Amount of new tweets:', newTwits.length);

        if (newTwits.length === 0) {
          setHasMoreTwits(false);
        } else {
          setTwits((prevTwits) => [...prevTwits, ...newTwits]);
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
          setLoading(false);
          return;
        }
        setTwits([]); // Reiniciar los tweets cuando cambia el usuario
        setHasMoreTwits(true); // Permitir la paginación para el nuevo usuario

        setLoading(true);
        await fetchUserData(userData.token);
        await fetchTweets();
        setLoading(false);
      };

      fetchData();
    }, [fetchUserData, userData])
  );

  const handleScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { nativeEvent } = event;
    if (
      nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
        nativeEvent.contentSize.height - 20 &&
      !loadingMore
    ) {
      await fetchTweets(true); // Cargar más tweets cuando se llega al final
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={styles.scrollViewContent}
        >
          {searchUserData && (
            <>
              <ProfileHeader
                user={searchUserData}
                bio={"Hi! Welcome to my profile. \nI'm a huge Messi fan!"}
                profilePhoto={/*searchUserData.profilePhoto ||*/ ''}
                bannerPhoto={/*searchUserData.bannerPhoto ||*/ ''}
              />
              <View style={styles.divider} />
            </>
          )}
          {twits.length > 0 ? (
            twits.map((twit) => (
              <TweetCard
                key={twit.id}
                profileImage={/*twit.user.profileImage*/ ''}
                name={twit.user.name}
                username={twit.user.username}
                content={twit.content}
                date={twit.createdAt}
              />
            ))
          ) : (
            <Text style={styles.noTwitsText}>No tweets available</Text>
          )}
          {loadingMore && <ActivityIndicator size="large" color="white" />}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    marginVertical: 20
  },
  noTwitsText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40
  }
});
