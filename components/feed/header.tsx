import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import VerifyButton from '../common/verifyButton';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

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
  fake_container: {
    width: 80,
    height: 40
  }
});

export default function HomeHeader() {
  const userData = useAtomValue(authenticatedAtom);

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
            style={[styles.logo, styles.profile_logo]}
            source={
              userData?.profilePicture
                ? { uri: userData?.profilePicture }
                : default_images.default_profile_picture
            }
          />
        </TouchableOpacity>
        <Image
          style={[styles.logo, { marginTop: 5, marginLeft: 20 }]}
          source={require('@/assets/images/logo.png')}
        />
        <View style={styles.fake_container}>
          <VerifyButton />
        </View>
      </View>
    </>
  );
}
