import { parseISO } from 'date-fns';
import { useFocusEffect, useRouter, useSegments } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useAtom } from 'jotai/index';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Divider, IconButton } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { TwitSnap } from '@/app/types/TwitSnap';
import { tweetDeleteAtom } from '@/atoms/deleteTweetAtom';
import { showTabsAtom } from '@/atoms/showTabsAtom';
import ThreeDotMenu from '@/components/twits/ThreeDotMenu';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';
import useAxiosInstance from '@/hooks/useAxios';

import ParsedContent from '../common/parsedContent';
import Interaction, { handlerReturn } from './interaction';
import Like from './Interactions/like';
import Retwit from './Interactions/retwit';
import TweetCard from './TweetCard';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface TweetCardProps {
  item: TwitSnap;
}

const window = Dimensions.get('screen');

const InteractionLabel = ({ count, label }: { count: number | undefined; label: string }) => {
  return (
    <>
      {count != undefined && count > 0 && (
        <View style={{ flexDirection: 'row', marginLeft: 10 }}>
          <Text>
            <Text style={{ fontWeight: 'bold', fontSize: 17, color: 'white' }}>{count || ''}</Text>
            <Text style={{ fontSize: 17, color: 'rgb(120 120 120)' }}> {label || ''} </Text>
          </Text>
        </View>
      )}
    </>
  );
};

const InspectTweetCard: React.FC<TweetCardProps> = ({ item }) => {
  const userData = useAtomValue(authenticatedAtom);
  const router = useRouter(); // Obtener el objeto de router
  const segments = useSegments(); // Obtener la ruta actual
  const axiosTwits = useAxiosInstance('twits');

  const [animatedValueComment] = useState(new Animated.Value(window.height));
  const [animatedValueThreeDot] = useState(new Animated.Value(window.height));

  const [isExpandedComment, setIsExpandedComment] = useState(false);
  const isExpandedCommentRef = useRef(false);

  const [isExpandedThreeDot, setIsExpandedThreeDot] = useState(false);
  const isExpandedRefThreeDot = useRef(false);

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);
  const [tweetDelete, setTweetDelete] = useAtom(tweetDeleteAtom);

  const [comments, setComments] = useState<TwitSnap[] | null>(null);

  const formatDate = (dateString: string): string => {
    const date = parseISO(dateString);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = date.toISOString().split('T')[0];
    return `${time} | ${formattedDate}`;
  };

  const sendComment = async (tweetContent: string) => {
    try {
      const response = await axiosTwits.post(
        `snaps`,
        {
          user: {
            userId: userData?.id,
            name: userData?.name,
            username: userData?.username
          },
          content: tweetContent.trim(),
          type: 'comment',
          parent: item.id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Twit sent: ', response.data);
    } catch (error: any) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handlePressComment = () => {
    setShowTabs(!showTabs);
    Animated.timing(animatedValueComment, {
      toValue: isExpandedComment ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpandedComment(!isExpandedComment);
    });
    Keyboard.dismiss();
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

  const onTwitDelete = async () => {
    try {
      const response = await axiosTwits.delete(`snaps/${item.id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 204) {
        setTweetDelete({ shouldDelete: true, twitId: [...tweetDelete.twitId, item.id] });
        router.back();
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  const onTwitEdit = async (tweetContent: string) => {
    try {
      const response = await axiosTwits.patch(
        `snaps/${item.id}`,
        {
          content: tweetContent
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.status === 204) {
        console.log('Successfully edited the tweet with id: ', item.id);
        router.back();
      }
    } catch (error) {
      console.error('Error editing tweet:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchComments = async (queryParams: object | undefined = undefined): Promise<void> => {
        await axiosTwits
          .get(`snaps`, {
            params: { ...queryParams, parent: item.id, type: 'comment' }
          })
          .then((response) => {
            console.log('Fetched: ', response.data.data.length, ' twits');
            setComments(response.data.data);
          })
          .catch(() => setComments([]));
      };

      fetchComments();

      return () => {
        setComments(null)

      }
    }, [])
  );

  return (
    <>
      <TouchableOpacity onPress={router.back} style={[styles.goBack, { marginTop: -28 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="arrow-left" iconColor="rgb(255 255 255)" size={24} />
          <Text style={{ color: 'rgb(255 255 255)', fontSize: 20, marginLeft: 5 }}>Post</Text>
        </View>
        <Divider style={{ height: 1, width: '100%', backgroundColor: 'rgb(60 60 60)' }} />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
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
        <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <Text style={styles.name}>{item.user.name}</Text>
            <Text style={styles.username}>@{item.user.username}</Text>
          </View>
          <IconButton
            icon="dots-horizontal"
            style={{ position: 'absolute', left: window.width - 120 }}
            size={24}
            onPress={() => {
              isExpandedRefThreeDot.current = !isExpandedRefThreeDot.current;
              setIsExpandedThreeDot(isExpandedRefThreeDot.current);
              handlePressThreeDot();
            }}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'column' }}>
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{<ParsedContent text={item.content} />}</Text>
        </View>

        <Text style={[styles.date]}>{formatDate(item.createdAt)}</Text>

        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <InteractionLabel count={item.retwitCount} label={'Retwits'} />
          <InteractionLabel count={item.likesCount} label={'Likes'} />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <Interaction
            icon="comment-outline"
            initState={false}
            initCount={undefined}
            handler={async (state: boolean, count?: number): Promise<handlerReturn> => {
              isExpandedCommentRef.current = !isExpandedCommentRef.current;
              setIsExpandedComment(isExpandedCommentRef.current);
              handlePressComment();
              return { state: true, count: 0 };
            }}
          />
          <Retwit initState={item.userRetwitted} initCount={item.retwitCount} twitId={item.id} />
          <Like initState={item.userLiked} initCount={item.likesCount} twitId={item.id} />
        </View>
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
            transform: [{ translateY: animatedValueComment }],
            bottom: 0
          }
        ]}
      >
        <View style={{ height: window.height }}>
          <TweetBoxFeed
            onTweetSend={(tweetContent) => {
              sendComment(tweetContent);
            }}
            onClose={handlePressComment}
            placeholder={`Replying to @${item.user.username}`}
          />
        </View>
      </Animated.View>
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
          <ThreeDotMenu
            onCloseOrFinish={handlePressThreeDot}
            onTwitDelete={onTwitDelete}
            onTwitEdit={onTwitEdit}
            twitContent={item.content}
            twitIsFromUser={item.user.username === userData?.username}
          />
        </View>
      </Animated.View>
      <>
        {comments && comments.length > 0 && (
          <FlatList
            data={comments}
            renderItem={({ item }) => <TweetCard item={item} />}
            keyExtractor={(item) => item.id}
          />
        )}
      </>
    </>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10
  },
  contentContainer: {
    marginHorizontal: 10
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
    fontSize: 18,
    paddingVertical: 5,
    color: 'rgb(220 220 220)'
  },
  date: {
    fontSize: 14,
    color: 'rgb(120 120 120)',
    marginLeft: 10,
    marginTop: 5
  },
  hashtag: {
    color: 'rgb(67,67,244)'
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
  },
  goBack: {
    paddingRight: 9,
    paddingTop: -10
  }
});

export default InspectTweetCard;
