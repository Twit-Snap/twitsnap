import { format } from 'date-fns';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { SearchedUser } from '@/app/types/publicUser';
import { router } from 'expo-router';
import { Button, IconButton } from 'react-native-paper';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

interface IProfileHeader {
  user: SearchedUser;
  bannerPhoto: string;
  profilePhoto: string;
  bio: string;
}

const default_images = {
  profilePhoto: require('../../assets/images/messi.jpg'),
  bannerPhoto: require('../../assets/images/kanagawa.jpg')
};

const ProfileHeader: React.FC<IProfileHeader> = ({ user, bannerPhoto, profilePhoto, bio }) => {
  const formattedBirthdate = user.birthdate
    ? format(new Date(user.birthdate), 'MMMM dd, yyyy')
    : null;
  const formattedJoinDate = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : null;

  return (
    <>
      <IconButton
        icon="arrow-left"
        size={20}
        style={{ position: 'absolute', top: 5, left: 5, zIndex: 50 }}
        iconColor="rgb(255 255 255)"
        containerColor="rgba(0 0 0 / 0.5)"
        onPress={router.back}
      />
      <Image
        source={bannerPhoto ? { uri: bannerPhoto } : default_images.bannerPhoto}
        style={styles.bannerPhoto}
      />
      <Image
        source={profilePhoto ? { uri: profilePhoto } : default_images.profilePhoto}
        style={styles.profilePhoto}
      />
      <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
        <Button
          compact={true}
          buttonColor={user.following ? 'rgb(5 5 5)' : 'rgb(255 255 255)'}
          onPress={() => {}}
          style={styles.button}
          aria-disabled={true}
          labelStyle={{
            fontWeight: 'bold',
            textAlign: 'center',
            textAlignVertical: 'center',
            margin: 0,
            color: user.following ? 'rgb(255 255 255)' : 'rgb(0 0 0)'
          }}
          contentStyle={{ height: 35, marginBottom: 2 }}
        >
          {user.following ? 'Following' : 'Follow'}
        </Button>
      </View>
      <View style={styles.textContainer}>
        {user && <Text style={styles.name}>{user.name}</Text>}
        {user && <Text style={styles.username}>@{user.username}</Text>}

        <Text style={styles.bio}>{bio}</Text>
        {/* Birthday and Join Date */}
        {formattedBirthdate && <Text style={styles.birthdate}>🎂 Born {formattedBirthdate}</Text>}
        {formattedJoinDate && <Text style={styles.joinDate}>📅 Joined {formattedJoinDate}</Text>}
      </View>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Text style={{ color: 'rgb(100 100 100)', fontSize: 17, marginLeft: 10 }}>
          <Text style={{ color: 'rgb(255 255 255)', fontWeight: 'bold' }}>
            {user.followingCount}
          </Text>
          {'  Following'}
        </Text>

        <Text style={{ color: 'rgb(100 100 100)', fontSize: 17, marginLeft: 20 }}>
          <Text style={{ color: 'rgb(255 255 255)', fontWeight: 'bold' }}>
            {user.followersCount}
          </Text>
          {'  Followers'}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80
  },
  bannerPhoto: {
    minHeight: windowHeight / 6,
    maxHeight: windowHeight / 6,
    width: windowWidth,
    resizeMode: 'cover'
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 200,
    borderWidth: 3,
    borderColor: 'black',
    top: 100,
    left: 10,
    position: 'absolute'
  },
  name: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold'
  },
  username: {
    fontSize: 16,
    color: 'grey'
  },
  bio: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    marginVertical: 5
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    flexDirection: 'column',
    top: -5
  },
  birthdate: {
    fontSize: 14,
    color: '#939090'
  },
  joinDate: {
    fontSize: 14,
    color: '#939090'
  },
  button: {
    paddingHorizontal: 30,
    marginRight: 11,
    paddingTop: 0,
    borderColor: 'rgb(80 80 80)',
    borderWidth: 1,
    marginTop: 10
  }
});

export default ProfileHeader;
