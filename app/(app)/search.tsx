import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {Searchbar} from 'react-native-paper';
import { router } from 'expo-router';
import TrendingHashtagChip from '@/components/hashtags/TrendingHashtagChip';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={'Search'}
        placeholderTextColor="white"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={{ color: 'white' }}
        iconColor="white"
        onIconPress={() => {
          if (searchQuery[0] === '#' && searchQuery.length > 1) {
                  router.push({pathname: `/searchResults`, params: {hashtag: searchQuery}});
              }else if (searchQuery.length > 1) {
                // Handle user search
                router.push({ pathname: `/searchProfile`, params: { username: searchQuery } });
              }
            }
        }
        onSubmitEditing={() => {
            if (searchQuery[0] === '#' && searchQuery.length > 1) {
                router.push({pathname: `/searchResults`, params: {hashtag: searchQuery}});
            }else if (searchQuery.length > 1) {
              // Handle user search
              router.push({ pathname: `/searchProfile`, params: { username: searchQuery } });
            }
        }}
      />
      <Text style={styles.trendingText}>Trending now</Text>
      <View style={styles.chipsContainer}>
        <TrendingHashtagChip trendingHashtag={"#Futbol"}/>
        <TrendingHashtagChip trendingHashtag={"#Messi"}/>
        <TrendingHashtagChip trendingHashtag={"#Test"}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgb(5 5 5)'
  },
  searchbar: {
    backgroundColor: '#2e2e2e'
  },
  trendingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'rgb(255 255 255)'
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10
  },
});
