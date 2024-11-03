import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter, useSegments } from 'expo-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';
import useAxiosInstance from '@/hooks/useAxios';

import ParsedContent from '../common/parsedContent';

import Interaction from './interaction';
import Like from './Interactions/like';
import Retwit from './Interactions/retwit';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface TweetCardProps {
  item: TwitSnap;
}

const TweetCard: React.FC<TweetCardProps> = ({ item }) => {
  const userData = useAtomValue(authenticatedAtom);
  const router = useRouter(); // Obtener el objeto de router
  const segments = useSegments(); // Obtener la ruta actual
  const axiosTwits = useAxiosInstance('twits');

  const formatDate = (dateString: string): string => {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours > 24) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.4}
      onPress={() =>
        router.push({
          pathname: '../twits/[id]',
          params: { id: item.id }
        })
      }
    >
      <>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '../profile/[username]',
              params: { username: item.user.username }
            })
          }
        >
          <Image
            source={
              item.user.profilePicture
                ? { uri: item.user.profilePicture }
                : default_images.default_profile_picture
            }
            style={styles.profilePicture}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={styles.contentContainer}>
            <Text style={styles.name}>
              {item.user.name}{' '}
              <Text style={styles.username}>
                @{item.user.username}
                <Text style={styles.dot}>{' - '}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </Text>
            </Text>
            <Text style={styles.content}>
              <ParsedContent text={item.content} />
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', maxHeight: 25 }}>
            <Interaction
              icon="comment-outline"
              initState={false}
              initCount={1_023_002_230}
              handler={async () => {
                router.push({
                  pathname: '../twits/[id]',
                  params: { id: item.id, openComment: 'true' }
                });
              }}
            />
            <Retwit initState={item.userRetwitted} initCount={item.retwitCount} twitId={item.id} />
            <Like initState={item.userLiked} initCount={item.likesCount} twitId={item.id} />
          </View>
        </View>
      </>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(25 25 25)',
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
  date: {
    fontSize: 12,
    color: 'rgb(120 120 120)'
  },
  dot: {
    fontSize: 16,
    color: 'rgb(120 120 120)'
  },
  interaction_icon: {
    margin: 0
  },
  interaction_label: {
    color: 'rgb(120 120 120)',
    textAlign: 'left',
    textAlignVertical: 'bottom',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 14,
    height: 36
  }
});

export default TweetCard;
