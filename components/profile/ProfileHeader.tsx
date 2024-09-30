import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Dimensions } from 'react-native';

import { UserAuth } from '@/app/types/authTypes';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

interface ProfileHeader {
  userAuth: UserAuth;
  bannerPhoto: string;
  profilePhoto: string;
  bio: string;
}

const default_images = {
  profilePhoto: require('../../assets/images/messi.jpg'),
  bannerPhoto: require('../../assets/images/kanagawa.jpg')
};

const ProfileHeader: React.FC<ProfileHeader> = ({ userAuth, bannerPhoto, profilePhoto, bio }) => {
  return (
    <View>
      <Image
        source={bannerPhoto ? { uri: bannerPhoto } : default_images.bannerPhoto}
        style={styles.bannerPhoto}
      />
      <View style={styles.profileHeader}>
        <View style={styles.textContainer}>
          <Image
            source={profilePhoto ? { uri: profilePhoto } : default_images.profilePhoto}
            style={styles.profilePhoto}
          ></Image>
          {userAuth && <Text style={styles.name}>{userAuth.name}</Text>}
          {userAuth && <Text style={styles.username}>@{userAuth.username}</Text>}
        </View>
      </View>
      <Text style={styles.bio}>{bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  bannerPhoto: {
    height: windowHeight / 4,
    width: windowWidth,
    resizeMode: 'cover'
  },
  profilePhoto: {
    width: 160,
    height: 160,
    borderRadius: 200,
    borderWidth: 3,
    borderColor: 'black',
    top: -85,
    left: 20
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -75,
    marginLeft: 25
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginLeft: 25
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center'
  }
});

export default ProfileHeader;
