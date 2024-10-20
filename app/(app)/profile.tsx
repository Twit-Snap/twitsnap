// ProfileScreen.tsx
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { SearchedUser } from '@/app/types/publicUser';
import { TwitSnap } from '@/app/types/TwitSnap';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TweetCard from '@/components/twits/TweetCard';

import { authenticatedAtom } from '../authAtoms/authAtom';

export default function ProfileScreen() {
  const [userData] = useAtom(authenticatedAtom);

  const [searchUserData, setSearchUserData] = useState<SearchedUser | null>(null);
  const [twits, setTwits] = useState<TwitSnap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTwits, setHasMoreTwits] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData || !userData.token) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${userData.username}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userData]);

  // Cargar tweets, con soporte de paginación
  const fetchTweets = useCallback(
    async (olderTwits = false) => {
      if (!hasMoreTwits || !userData?.username) return;

      const lastTwit = olderTwits ? twits[twits.length - 1] : undefined;
      const queryParams = lastTwit
        ? { createdAt: lastTwit.createdAt, older: true, limit: 20, username: userData.username }
        : { limit: 20, username: userData.username };

      try {
        setLoadingMore(true);

        const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps/`, {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${userData.token}`
          }
        });
        const newTwits = response.data.data;

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
    [hasMoreTwits, twits, userData]
  );

  useFocusEffect(
    useCallback(() => {
      const fetchTweetsOnFocus = async () => {
        setTwits([]);
        setHasMoreTwits(true);
        setLoading(true);
        await fetchTweets();
        setLoading(false);
      };

      fetchTweetsOnFocus();
    }, [])
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
                profilePhoto={searchUserData.profilePicture || ''}
                bannerPhoto={/*searchUserData.bannerPhoto ||*/ ''}
              />
              <View style={styles.divider} />
            </>
          )}
          {twits.length > 0 ? (
            twits.map((twit) => <TweetCard item={twit} key={twit.id} />)
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
