import React, { useState } from 'react';
import {View, StyleSheet, Text} from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';


export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    return (
        <View style={styles.container}>
            <Searchbar placeholder={"Search"} placeholderTextColor="white" onChangeText={setSearchQuery} value={searchQuery} style={styles.searchbar} inputStyle={{ color: 'white' }} iconColor="white" />
            <Text style={styles.trendingText}>Trending now</Text>
            <View style={styles.chipsContainer}>
                <Chip style={[styles.chip, styles.chipLightBlack]} textStyle={{ color: 'white' }} onPress={() => {}}>#Football</Chip>
                <Chip style={[styles.chip, styles.chipLightBlack]} textStyle={{ color: 'white' }} onPress={() => {}}>#PSG</Chip>
                <Chip style={[styles.chip, styles.chipLightBlack]} textStyle={{ color: 'white' }} onPress={() => {}}>#WorldCup</Chip>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    searchbar: {
        backgroundColor: '#2e2e2e',
    },
    trendingText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 10,
    },
    chip: {
        margin: 4,
    },
    chipLightBlack: {
        backgroundColor: '#333333',
    },
});