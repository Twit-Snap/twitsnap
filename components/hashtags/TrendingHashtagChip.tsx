import { router } from 'expo-router';
import {Chip } from 'react-native-paper'
import React from "react";
import {StyleSheet} from "react-native";

interface TrendingHashtagChip {
    trendingHashtag : string;
}

const TrendingHashtagChip: React.FC<TrendingHashtagChip> = ({trendingHashtag}) => {
    return(
        <Chip style={[styles.chip, styles.chipLightBlack]} textStyle={{ color: 'white' }} onPress={() => {
            router.push({ pathname: `/searchResults`, params: { hashtag: trendingHashtag } });
        }}>
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