import { IReducedUser } from '@/app/types/publicUser';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

export default function UserCard({
  item,
  handler
}: {
  item: IReducedUser;
  handler: (username: string) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        handler(item.username);
      }}
      style={styles.container}
      activeOpacity={0.4}
    >
      <>
        <Image
          source={
            item.profilePicture
              ? { uri: item.profilePicture }
              : default_images.default_profile_picture
          }
          style={styles.profilePicture}
        />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={styles.contentContainer}>
            <Text style={styles.name}>
              {item.name} <Text style={styles.username}>@{item.username}</Text>
            </Text>
            {/* <Text style={styles.content}>{renderContent(item.description)}</Text> */}
          </View>
        </View>
      </>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(50 50 50)',
    backgroundColor: 'rgb(5 5 5)'
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 25
  },
  contentContainer: {
    flex: 1,
    marginLeft: 10
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgb(255 255 255)'
  },
  username: {
    fontWeight: 'light',
    color: 'rgb(120 120 120)',
    fontSize: 14
  },
  content: {
    fontSize: 14,
    color: 'rgb(220 220 220)'
  },
  hashtag: {
    color: 'rgb(67,67,244)'
  }
});
