import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';

import ParsedContent from '../common/parsedContent';

import Interaction from './interaction';
import Bookmark from './Interactions/bookmark';
import Like from './Interactions/like';
import Retwit from './Interactions/retwit';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface TweetCardProps {
  item: TwitSnap;
  showReply?: boolean;
}

const TweetCard: React.FC<TweetCardProps> = ({ item, showReply = true }) => {
  const userData = useAtomValue(authenticatedAtom);
  const router = useRouter(); // Obtener el objeto de router\

  const tweet = item.type === 'retwit' ? item.parent : item;

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
          params: { id: tweet.id }
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
              item.profilePicture
                ? { uri: item.profilePicture }
                : default_images.default_profile_picture
            }
            style={styles.profilePicture}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={styles.contentContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.name}>
                {item.user.name}{' '}
                <Text style={styles.username}>
                  @{item.user.username}
                  <Text style={styles.dot}>{' · '}</Text>
                  <Text style={styles.date}>
                    {formatDate(item.createdAt)}
                    {'   '}
                  </Text>
                </Text>
              </Text>
              {item.privacy === 'Only Followers' && (
                <Icon source={'lock'} size={22} color={'rgb(120, 120, 120)'} />
              )}
            </View>
            <Text style={styles.content}>
              <ParsedContent text={item.content} />
            </Text>
          </View>
        </View>
        {item.type === 'retwit' && (
          <View style={{ flexDirection: 'row', marginLeft: 22, marginBottom: 5 }}>
            <Icon source="repeat" size={20} color="rgb(120 120 120)" />
            <Text
              style={{ color: 'rgb(120 120 120)', marginLeft: 8, fontWeight: 'bold' }}
            >{`${item.user.username === userData?.username ? 'You' : item.user.username} retwitted`}</Text>
          </View>
        )}
        {tweet.type === 'comment' && showReply && (
          <TouchableOpacity
            style={{ flexDirection: 'row', paddingLeft: 50, width: '100%', marginBottom: 5 }}
            onPress={() =>
              router.push({
                pathname: '../twits/[id]',
                params: { id: item.parent ? item.parent.id : 'nonExistentId' }
              })
            }
          >
            <Text style={{ color: 'rgb(120 120 120)', fontWeight: 'bold' }}>
              {
                <ParsedContent
                  text={`Replying to @${tweet.user.username}`}
                  color={'rgb(120 120 120)'}
                  fontSize={13}
                />
              }
            </Text>
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '../profile/[username]',
                params: { username: tweet.user.username }
              })
            }
          >
            <Image
              source={
                tweet.user.profilePicture
                  ? { uri: tweet.user.profilePicture }
                  : default_images.default_profile_picture
              }
              style={styles.profilePicture}
            />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={styles.contentContainer}>
              <Text style={styles.name}>
                {tweet.user.name}{' '}
                <Text style={styles.username}>
                  @{tweet.user.username}
                  <Text style={styles.dot}>{' - '}</Text>
                  <Text style={styles.date}>{formatDate(tweet.createdAt)}</Text>
                </Text>
              </Text>
              <Text style={styles.content}>
                <ParsedContent text={tweet.content} />
              </Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', maxHeight: 25 }}>
              <Interaction
                icon="comment-outline"
                initState={false}
                initCount={item.commentCount}
                handler={async () => {
                  router.push({
                    pathname: '../twits/[id]',
                    params: { id: tweet.id, openComment: 'true' }
                  });
                }}
              />
              <Retwit
                initState={item.userRetwitted}
                initCount={item.retwitCount}
                twitId={tweet.id}
              />
              <Like initState={item.userLiked} initCount={item.likesCount} twitId={tweet.id} />
              <Bookmark
                initState={item.userBookmarked}
                initCount={item.bookmarkCount}
                twitId={tweet.id}
              />
            </View>
          </View>
        </View>
      </>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
    color: 'rgb(120 120 120)',
    marginEnd: 10
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
