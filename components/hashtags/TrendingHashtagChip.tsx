import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

interface ITrendingHashtagChip {
  trendingHashtag: string;
}

const TrendingHashtagChip: React.FC<ITrendingHashtagChip> = ({ trendingHashtag }) => {
  return (
    <Chip
      style={[styles.chip, styles.chipLightBlack]}
      textStyle={{ color: 'white' }}
      onPress={() => {
        router.push({ pathname: `/searchResults`, params: { hashtag: trendingHashtag } });
      }}
    >
      {trendingHashtag}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    margin: 4
  },
  chipLightBlack: {
    backgroundColor: '#333333'
  }
});

export default TrendingHashtagChip;
