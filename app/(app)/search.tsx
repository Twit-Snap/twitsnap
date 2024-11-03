import React from 'react';
import { StyleSheet } from 'react-native';

import MenuSearchBar from '@/components/search/menuSearchBar';

export default function SearchScreen() {
  return (
    <MenuSearchBar />
    // <View style={styles.container}>
    //   {/* <Text style={styles.trendingText}>Trending now</Text>
    //   <View style={styles.chipsContainer}>
    //     <TrendingHashtagChip trendingHashtag={'#Futbol'} />
    //     <TrendingHashtagChip trendingHashtag={'#Messi'} />
    //     <TrendingHashtagChip trendingHashtag={'#Test'} />
    //   </View> */}
    // </View>
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
  }
});
