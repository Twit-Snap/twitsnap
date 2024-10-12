import { format } from 'date-fns';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { SearchedUser } from '@/app/types/publicUser';

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
          {user && <Text style={styles.name}>{user.name}</Text>}
          {user && <Text style={styles.username}>@{user.username}</Text>}

          {/* Birthday and Join Date */}
          {formattedBirthdate && <Text style={styles.birthdate}>🎂 Born {formattedBirthdate}</Text>}
          {formattedJoinDate && <Text style={styles.joinDate}>📅 Joined {formattedJoinDate}</Text>}
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
    color: 'white',
    fontWeight: 'bold',
    marginTop: -70,
    marginLeft: 5
  },
  username: {
    fontSize: 16,
    color: 'grey',
    marginLeft: 5
  },
  bio: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    marginBottom: 5
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  birthdate: {
    fontSize: 14,
    color: '#939090',
    marginTop: 23
  },
  joinDate: {
    fontSize: 14,
    color: '#939090',
    marginTop: 10
  }
});

export default ProfileHeader;
