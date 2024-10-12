import axios from 'axios';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';

import { SearchedUser } from '@/app/types/publicUser';
import { TwitSnap } from '@/app/types/TwitSnap';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TweetCard from '@/components/twits/TweetCard';

import { authenticatedAtom } from '../authAtoms/authAtom';

export default function PublicProfileScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const { username } = useLocalSearchParams<{ username: string }>();

  const [searchUserData, setSearchUserData] = useState<SearchedUser | null>(null);
  const [loading, setLoading] = useState(true);

  /*useEffect(() => {
    const fetchUserData = async () => {
      if (!userData || !userData.token) {
        console.error('No token found.');
        return; // You can choose to handle this case appropriately (e.g., redirect to login)
      }

      if (username) {
        try {
          const response = await axios.get(
            `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${username}`,
            {
              headers: {
                Authorization: `Bearer ${userData.token}`
              }
            }
          );
          setSearchUserData(response.data.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [username]);*/

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        if (!userData || !userData.token) {
          console.error('No token found.');
          return; // Handle this case appropriately
        }

        if (username) {
          setLoading(true); // Start loading
          try {
            const response = await axios.get(
              `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${username}`,
              {
                headers: {
                  Authorization: `Bearer ${userData.token}`
                }
              }
            );

            const newUserData: SearchedUser = response.data.data;

            // Only update state if the fetched data is different from current state
            if (JSON.stringify(newUserData) !== JSON.stringify(searchUserData)) {
              setSearchUserData(newUserData); // Update state if data has changed
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } finally {
            setLoading(false); // End loading
          }
        }
      };

      fetchUserData(); // Call the function to fetch data
    }, [userData, username, searchUserData]) // Dependencies
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView>
        {searchUserData ? (
          <>
            <ProfileHeader
              user={searchUserData}
              bio={"Hi! Welcome to my profile. \nI'm a huge Messi fan!"}
              profilePhoto={/*searchUserData.profilePhoto ||*/ ''}
              bannerPhoto={/*searchUserData.bannerPhoto || */''}
            />
            <View style={styles.divider} />
          </>
        ) : (
          <Text style={styles.errorText}>User not found</Text>
        )}
        <FlatList<TwitSnap>
          data={searchUserData?.twits || []}
          renderItem={({ item }) => (
            <TweetCard
              profileImage={/*searchUserData?.profilePhoto ||*/ ''}
              name={searchUserData?.name || ''}
              username={searchUserData?.username || ''}
              content={item.content}
              date={item.createdAt}
            />
          )}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgb(5 5 5)'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(5 5 5)',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 20
  }
});
