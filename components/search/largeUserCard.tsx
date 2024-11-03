import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { SearchedUser } from '@/app/types/publicUser';

import FollowButton from '../profile/followButton';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const default_images = {
  profilePhoto: require('../../assets/images/messi.jpg'),
  backgroundImage: require('../../assets/images/kanagawa.jpg')
};

export default function LargeUserCard({ item }: { item: SearchedUser }) {
  const authUser = useAtomValue(authenticatedAtom);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.5}
      onPress={() =>
        router.push({
          pathname: `/(app)/profile/[username]`,
          params: { username: item.username }
        })
      }
    >
      <Image
        source={
          item.backgroundImage ? { uri: item.backgroundImage } : default_images.backgroundImage
        }
        style={styles.backgroundImage}
      />
      <Image
        source={item.profilePicture ? { uri: item.profilePicture } : default_images.profilePhoto}
        style={styles.profilePhoto}
      />
      <View
        style={{
          flex: 1,
          flexDirection: 'row-reverse',
          maxHeight: 40,
          alignContent: 'center',
          top: -5
        }}
      >
        {item.username !== authUser?.username && (
          <FollowButton extraCallback={() => {}} user={item} />
        )}
      </View>
      <View style={styles.textContainer}>
        {item && <Text style={styles.name}>{item.name}</Text>}
        {item && <Text style={styles.username}>@{item.username}</Text>}

        <Text style={styles.description} numberOfLines={4} ellipsizeMode="tail">
          {item.description
            ? item.description
            : 'Había una vez una pequeña niña llamada Caperucita Roja que vivía en un bosque muy bonito. Un día, su abuelita enfermó y le pidió que le llevara una cesta con comida.'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    borderRadius: 10,
    minHeight: windowHeight * 0.35,
    maxHeight: windowHeight * 0.35,
    minWidth: windowWidth * 0.7,
    maxWidth: windowWidth * 0.7,
    borderWidth: 1,
    borderColor: 'rgb(40 40 40)'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80,
    borderRadius: 10
  },
  backgroundImage: {
    minHeight: 125,
    maxHeight: 125,
    minWidth: windowWidth * 0.7,
    maxWidth: windowWidth * 0.7,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    resizeMode: 'cover'
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 200,
    borderWidth: 3,
    borderColor: 'black',
    top: 80,
    left: 10,
    position: 'absolute'
  },
  name: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },
  username: {
    fontSize: 16,
    color: 'grey',
    top: -4
  },
  description: {
    fontSize: 16,
    color: 'white',
    lineHeight: 18,
    marginBottom: 5
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
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
    marginRight: 11,
    paddingTop: 0,
    borderColor: 'rgb(80 80 80)',
    borderWidth: 1,
    marginTop: 10
  }
});
