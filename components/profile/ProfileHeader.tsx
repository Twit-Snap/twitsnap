import { format } from 'date-fns';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { SearchedUser } from '@/app/types/publicUser';
import axios from 'axios';
import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { Button, IconButton } from 'react-native-paper';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

interface IProfileHeader {
  user: SearchedUser;
  bannerPhoto: string;
  profilePhoto: string;
  bio: string;
}

type SpecialButtonProps = {
  color: string;
  text: string;
  textColor: string;
  handler: () => void;
};

const default_images = {
  profilePhoto: require('../../assets/images/messi.jpg'),
  bannerPhoto: require('../../assets/images/kanagawa.jpg')
};

const ProfileHeader: React.FC<IProfileHeader> = ({ user, bannerPhoto, profilePhoto, bio }) => {
  const formattedBirthdate = user.birthdate
    ? format(new Date(user.birthdate), 'MMMM dd, yyyy')
    : null;
  const formattedJoinDate = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : null;

  const authUser = useAtomValue(authenticatedAtom);
  // const [following, setFollowing] = useState<boolean | undefined>(user.following);
  const following = useRef<boolean>(user.following ? true : false);
  const followersCount = useRef<number>(user.followersCount ? user.followersCount : 0);
  const [followersCountRendered, refreshCount] = useState<number>(followersCount.current);

  const defineButtonProps = (following: boolean | undefined): SpecialButtonProps => {
    if (user.username === authUser?.username) {
      return {
        color: 'rgb(5 5 5)',
        text: 'Edit profile',
        textColor: 'rgb(255 255 255)',
        handler: () => {
          //EDIT PROFILE ROUTER PUSH
        }
      };
    }

    if (following) {
      return {
        color: 'rgb(5 5 5)',
        text: 'Following',
        textColor: 'rgb(255 255 255)',
        handler: async () => {
          await axios
            .delete(
              `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${authUser?.username}/followers`,
              {
                data: {
                  followedUsername: user.username
                },
                headers: {
                  Authorization: `Bearer ${authUser?.token}`
                }
              }
            )
            .then(() => {
              setFollowingState();
              followersCount.current--;
              refreshCount(followersCount.current)
            })
            .catch((error) => {
              console.error(error);
            });
        }
      };
    }

    return {
      color: 'rgb(255 255 255)',
      text: 'Follow',
      textColor: 'rgb(0 0 0)',
      handler: async () => {
        await axios
          .post(
            `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${authUser?.username}/followers`,
            {
              followedUsername: user.username
            },
            {
              headers: {
                Authorization: `Bearer ${authUser?.token}`
              }
            }
          )
          .then(() => {
            setFollowingState();
            followersCount.current++;
            refreshCount(followersCount.current)
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };
  };

  const [specialButtonProps, setSpecialButtonProps] = useState<SpecialButtonProps>(
    defineButtonProps(user.following)
  );

  const setFollowingState = () => {
    following.current = !following.current;
    setSpecialButtonProps(defineButtonProps(following.current));
  };

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
          buttonColor={specialButtonProps.color}
          onPress={specialButtonProps.handler}
          style={styles.button}
          aria-disabled={true}
          labelStyle={{
            fontWeight: 'bold',
            textAlign: 'center',
            textAlignVertical: 'center',
            margin: 0,
            color: specialButtonProps.textColor
          }}
          contentStyle={{ height: 35, marginBottom: 2, paddingHorizontal: 30, width: 150 }}
        >
          {specialButtonProps.text}
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
            {followersCountRendered}
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
    marginRight: 11,
    paddingTop: 0,
    borderColor: 'rgb(80 80 80)',
    borderWidth: 1,
    marginTop: 10
  }
});

export default ProfileHeader;
