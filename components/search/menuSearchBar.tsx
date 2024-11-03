import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import React from 'react';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(5 5 5)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    width: window.width,
    maxHeight: 50,
    alignItems: 'center'
  },
  logo: {
    width: 40,
    height: 40
  },
  profile_logo: {
    borderRadius: 200,
    alignSelf: 'center'
  },
  searchbar: {
    backgroundColor: 'rgb(46 46 46)',
    width: window.width * 0.8,
    height: 35,
    marginHorizontal: 10,
    paddingHorizontal: 20,
    borderRadius: 200,
    color: 'rgb(255 255 255)',
    fontSize: 16
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

export default function MenuSearchBar() {
  const userData = useAtomValue(authenticatedAtom);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = () => {
    if (searchQuery.length > 0) {
      router.push({ pathname: `/searchResults`, params: { query: searchQuery } });
      setSearchQuery('');
    }
  };

  if (!userData) {
    return <></>;
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: `/(app)/profile/[username]`,
              params: { username: userData?.username }
            })
          }
        >
          <Image
            style={StyleSheet.compose(styles.logo, styles.profile_logo)}
            source={
              userData?.profilePicture
                ? { uri: userData.profilePicture }
                : require('@/assets/images/messi.jpg')
            }
          />
        </TouchableOpacity>
        <TextInput
          placeholder={'Search TwitSnap'}
          placeholderTextColor="rgb(150 150 150)"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          maxLength={80}
          onSubmitEditing={handleSubmit}
        />
      </View>
    </>
  );
}
