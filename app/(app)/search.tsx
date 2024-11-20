import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';

import MenuSearchBar from '@/components/search/menuSearchBar';
import TopicCard from '@/components/search/topicCard';
import useAxiosInstance from '@/hooks/useAxios';

export default function SearchScreen() {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const axiosTwits = useAxiosInstance('twits');

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

      fetchTrendingTopics();
    }, [])
  );

  return (
    <>
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
          />
        </View>
      </View>
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
