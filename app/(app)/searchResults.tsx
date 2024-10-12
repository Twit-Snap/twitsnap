import { TwitSnap, TwitUser } from '@/app/types/TwitSnap';
import TweetCard from '@/components/twits/TweetCard';
import removeDuplicates from '@/utils/removeDup';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Appbar } from 'react-native-paper';
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

  const [tweets, setTweets] = useState<TwitSnap[] | null>(null);
  const [users, setUsers] = useState<TwitUser[] | null>(null);

  useEffect(() => {
    const fetchByHashtag = async (): Promise<TwitSnap[]> => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}hashtags/${query}`
        );

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
  }, [query]);

    return (
        <View style={styles.container}>
            <Appbar.Header style={{ backgroundColor: 'rgb(0 0 0)' } }>
                <Appbar.BackAction onPress={() => router.push("/home")} color="rgb(255 255 255)" />
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
        backgroundColor: 'rgb(5 5 5)',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'rgb(255 255 255)',
    },
});