import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useAtom } from 'jotai/index';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Divider, IconButton } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { SearchedUser } from '@/app/types/publicUser';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import ThreeDotMenuProfile from '@/components/profile/ThreeDotMenuProfile';

import FollowButton from './followButton';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const default_images = {
  profilePhoto: require('../../assets/images/messi.jpg'),
  bannerPhoto: require('../../assets/images/kanagawa.jpg')
};

const ProfileHeader = ({ user }: { user: SearchedUser }) => {
  const formattedBirthdate = user?.birthdate
    ? format(new Date(user.birthdate), 'MMMM dd, yyyy')
    : null;
  const formattedJoinDate = user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : null;

  const authUser = useAtomValue(authenticatedAtom);

  const canViewFollowList = (following: boolean): boolean => {
    return user?.username === authUser?.username
      ? true
      : user?.followed && following
        ? true
        : false;
  };

  const window = Dimensions.get('screen');

  const [canViewList, setCanViewList] = useState<boolean>(
    canViewFollowList(user?.following ? user.following : false)
  );
  const followersCount = useRef<number>(user?.followersCount ? user.followersCount : 0);
  const [followersCountRendered, refreshCount] = useState<number>(followersCount.current);
  const [animatedValueThreeDot] = useState(new Animated.Value(window.height));

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);

  const [isExpandedThreeDot, setIsExpandedThreeDot] = useState(false);
  const isExpandedRefThreeDot = useRef(false);

  const [, setIsAuthenticated] = useAtom(authenticatedAtom);

  const setFollowingCount = (nowFollowing: boolean) => {
    nowFollowing ? followersCount.current++ : followersCount.current--;
    refreshCount(followersCount.current);
    setCanViewList(canViewFollowList(nowFollowing));
  };

  const handlePressThreeDot = () => {
    setShowTabs(!showTabs);
    Animated.timing(animatedValueThreeDot, {
      toValue: isExpandedThreeDot ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpandedThreeDot(!isExpandedThreeDot);
    });
    Keyboard.dismiss();
  };

  const handleLogOut = async () => {
    try {
      await AsyncStorage.removeItem('auth');
      setIsAuthenticated(null);
      console.log('Log out successful');
      router.replace('/home');
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
        source={user?.backgroundImage ? { uri: user.backgroundImage } : default_images.bannerPhoto}
        style={styles.bannerPhoto}
      />
      <Image
        source={user?.profilePicture ? { uri: user.profilePicture } : default_images.profilePhoto}
        style={styles.profilePhoto}
      />
      <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
        {user?.id ? (
          user.username === authUser?.username ? (
            <IconButton
              icon="cog"
              style={{ position: 'absolute', left: window.width - 80 }}
              size={30}
              onPress={() => {
                isExpandedRefThreeDot.current = !isExpandedRefThreeDot.current;
                setIsExpandedThreeDot(isExpandedRefThreeDot.current);
                handlePressThreeDot();
              }}
            />
          ) : (
            <FollowButton extraCallback={setFollowingCount} user={user} />
          )
        ) : (
          <View style={{ height: 30 }} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{user?.name || ''}</Text>
        <Text style={styles.username}>@{user?.username || ''}</Text>

        {user?.description && <Text style={styles.bio}>{user?.description || ''}</Text>}

        {formattedBirthdate && <Text style={styles.birthdate}>🎂 Born {formattedBirthdate}</Text>}
        {formattedJoinDate && <Text style={styles.joinDate}>📅 Joined {formattedJoinDate}</Text>}
      </View>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* If you just check var1 && var2 && ..., it breaks. It must be var1 != undefined && var2 != undefined */}
        {user?.followersCount !== undefined && user?.followingCount != undefined && (
          <>
            <TouchableOpacity
              activeOpacity={canViewList ? 0.4 : 1}
              onPress={
                canViewList
                  ? () =>
                      router.push({
                        pathname: `../profile/[username]/showFollows`,
                        params: { username: user.username, byFollowers: 'false' }
                      })
                  : () => {}
              }
            >
              <Text style={{ color: 'rgb(100 100 100)', fontSize: 17, marginLeft: 10 }}>
                <Text style={{ color: 'rgb(255 255 255)', fontWeight: 'bold' }}>
                  {user.followingCount}
                </Text>
                {'  Following'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={canViewList ? 0.4 : 1}
              onPress={
                canViewList
                  ? () =>
                      router.push({
                        pathname: `../profile/[username]/showFollows`,
                        params: { username: user.username, byFollowers: 'true' }
                      })
                  : () => {}
              }
            >
              <Text style={{ color: 'rgb(100 100 100)', fontSize: 17, marginLeft: 20 }}>
                <Text style={{ color: 'rgb(255 255 255)', fontWeight: 'bold' }}>
                  {followersCountRendered}
                </Text>
                {'  Followers'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <Animated.View
        style={[
          {
            backgroundColor: 'rgb(5 5 5)',
            zIndex: 50,
            position: 'absolute',
            bottom: 0,
            top: 0,
            paddingTop: 35,
            width: window.width
          },
          {
            transform: [{ translateY: animatedValueThreeDot }],
            top: '30%'
          }
        ]}
      >
        <View style={{ borderRadius: 30 }}>
          <Divider
            style={{
              height: 2,
              width: '30%',
              backgroundColor: 'rgb(194,187,187)',
              marginLeft: '35%',
              marginRight: '35%'
            }}
          />
          <ThreeDotMenuProfile handleLogOut={handleLogOut} onCloseOrFinish={handlePressThreeDot} />
        </View>
      </Animated.View>
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
    marginTop: 30,
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
    flexDirection: 'column'
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
