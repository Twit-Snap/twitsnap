import { useFocusEffect } from 'expo-router';
import { useAtom } from 'jotai/index';
import React, { useCallback, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';

import { SearchedUser } from '@/app/types/publicUser';
import LargeUserCard from '@/components/search/largeUserCard';
import MenuSearchBar from '@/components/search/menuSearchBar';
import TopicCard from '@/components/search/topicCard';
import useAxiosInstance from '@/hooks/useAxios';

import { authenticatedAtom } from '../authAtoms/authAtom';

export default function SearchScreen() {
  const [userData] = useAtom(authenticatedAtom);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedAccounts, setSuggestedAccounts] = useState<SearchedUser[]>([]);

  const axiosTwits = useAxiosInstance('twits');
  const axiosUsers = useAxiosInstance('users');

  useFocusEffect(
    useCallback(() => {
      const fetchTrendingTopics = async () => {
        try {
          const response = await axiosTwits.get(`snaps/trending`, {});
          const data = await response.data.data;
          console.log('Trending topics:', data);
          setTrendingTopics(data);
        } catch (error) {
          console.error('Error fetching trending topics:', error);
        }
      };

      const fetchSuggestedAccounts = async () => {
        try {
          const response = await axiosUsers.get(`users/${userData?.username}`, {
            params: { suggestAccounts: true, limit: 10 }
          });
          const data = await response.data.data;
          console.log('Suggested accounts:', data);
          setSuggestedAccounts(data);
        } catch (error) {
          console.error('Error fetching suggested accounts:', error);
        }
      };

      fetchTrendingTopics();
      fetchSuggestedAccounts();

      console.log(suggestedAccounts);
    }, [])
  );

  // @ts-ignore
  return (
    <>
      <ScrollView>
        <MenuSearchBar />
        <View style={styles.trendingContainer}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 5 }}>
            Now Trending
          </Text>
          <Divider />
          <View style={{ flexDirection: 'column', marginVertical: 10 }}>
            <FlatList<{ [key: string]: number }>
              data={trendingTopics}
              renderItem={({ item }) => {
                const topicName = Object.keys(item)[0];
                const count = item[topicName];
                return <TopicCard topic={{ topicName, count }} />;
              }}
              scrollEnabled={false}
            />
          </View>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 5 }}>
            Who to follow next
          </Text>
          <View
            style={{
              paddingHorizontal: 10,
              paddingTop: 10,
              borderWidth: 1,
              borderBottomColor: 'rgb(40 40 40)'
            }}
          >
            <FlatList
              style={{ paddingVertical: 10 }}
              horizontal={true}
              data={suggestedAccounts}
              renderItem={({ item }) => <LargeUserCard item={item} />}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgb(5 5 5)'
  },
  searchbar: {
    backgroundColor: '#2e2e2e'
  },
  trendingContainer: {
    marginTop: 20,
    padding: 10
  }
});
