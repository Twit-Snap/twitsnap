import { parseISO } from 'date-fns';
import { useFocusEffect, useLocalSearchParams, useSegments } from 'expo-router';
import { useExpoRouter } from 'expo-router/build/global-state/router-store';
import { useAtomValue, useSetAtom } from 'jotai';
import { useAtom } from 'jotai/index';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { showTabsAtom } from '@/atoms/showTabsAtom';
import ParsedContent from '@/components/common/parsedContent';
import Interaction from '@/components/twits/interaction';
import Bookmark from '@/components/twits/Interactions/bookmark';
import Like from '@/components/twits/Interactions/like';
import Retwit from '@/components/twits/Interactions/retwit';
import ThreeDotMenu from '@/components/twits/ThreeDotMenu';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';
import TweetCard from '@/components/twits/TweetCard';
import useAxiosInstance from '@/hooks/useAxios';
import { twitsAtom } from '../home/twitsAtom';

const default_images = {
  default_profile_picture: require('../../../assets/images/no-profile-picture.png')
};

interface TweetCardProps {
  tweet: TwitSnap;
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

const TwitView: React.FC = () => {
  const [tweet, setTweet] = useState<TwitSnap | null>(null);
  const setTweets = useSetAtom(twitsAtom);
  const [error, setError] = useState<string>('');
  const { id, comm, openComment } = useLocalSearchParams<{
    id: string;
    comm: string;
    openComment: string;
  }>();
  const axiosTwits = useAxiosInstance('twits');

  const userData = useAtomValue(authenticatedAtom);
  const router = useExpoRouter();
  const segments = useSegments(); // Obtener la ruta actual

  const [animatedValueComment] = useState(new Animated.Value(window.height));
  const [animatedValueThreeDot] = useState(new Animated.Value(window.height));

  const [isExpandedComment, setIsExpandedComment] = useState(false);
  const isExpandedCommentRef = useRef(false);

  const [isExpandedThreeDot, setIsExpandedThreeDot] = useState(false);
  const isExpandedRefThreeDot = useRef(false);

  const [showTabs, setShowTabs] = useAtom(showTabsAtom);

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
          parent: tweet?.id
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
    isExpandedCommentRef.current = !isExpandedCommentRef.current;
    setShowTabs(!showTabs);
    Animated.timing(animatedValueComment, {
      toValue: isExpandedComment ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpandedComment(isExpandedCommentRef.current);
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
    await axiosTwits
      .delete(`snaps/${tweet?.id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(() => {
        setTweets((current) => current && current?.filter(({ id }) => !(id === tweet?.id)));
        router.goBack();
      })
      .catch((error) => {
        setError(error.response.data.detail);
      });
  };

  const onTwitEdit = async (tweetContent: string) => {
    await axiosTwits
      .patch(
        `snaps/${tweet?.id}`,
        {
          content: tweetContent
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then(({ data }: { data: { data: TwitSnap } }) => {
        console.log('Successfully edited the tweet with id: ', tweet?.id);

        setTweet((current) => current && { ...current, content: data.data.content });

        setTweets(
          (current) =>
            current &&
            current.map((t) => (t.id === tweet?.id ? { ...t, content: data.data.content } : t))
        );
      })
      .catch((error) => {
        setError(error.response.data.detail);
      });
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTweet = async () => {
        await axiosTwits
          .get(`snaps/${id}`)
          .then(({ data }) => {
            console.log(`Fetched twit with id ${id}`);
            console.log(data.data);
            setTweet(data.data as TwitSnap);
          })
          .catch((error) => {
            setError(error.response.data.detail);
          });
      };

      const fetchComments = async (queryParams: object | undefined = undefined): Promise<void> => {
        await axiosTwits
          .get(`snaps`, {
            params: { ...queryParams, parent: id, type: '["comment"]' }
          })
          .then((response) => {
            console.log('Fetched: ', response.data.data.length, ' twits');
            setComments(response.data.data);
          })
          .catch(() => setComments([]));
      };
      if (!id) {
        return;
      }

      if (id === 'nonExistentId') {
        setError('Tweet not found');
        return;
      }

      fetchTweet();

      fetchComments();

      if (openComment === 'true') {
        router.setParams({ comm: 'true' });
      }

      return () => {
        setComments(null);
        setTweet(null);
        setError('');
      };
    }, [id, openComment])
  );

  useEffect(() => {
    if (comm === 'true') {
      handlePressComment();
    }
  }, [comm]);

  if (!tweet && !comments && !error) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1, paddingVertical: 30 }}>
      <TouchableOpacity onPress={router.goBack} style={[styles.goBack, { marginTop: -28 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="arrow-left" iconColor="rgb(255 255 255)" size={24} />
          <Text style={{ color: 'rgb(255 255 255)', fontSize: 20, marginLeft: 5 }}>Post</Text>
        </View>
        <Divider style={{ height: 1, width: '100%', backgroundColor: 'rgb(60 60 60)' }} />
      </TouchableOpacity>
      {tweet && comments ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
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
            <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
              <View>
                <Text style={styles.name}>{tweet.user.name}</Text>
                <Text style={styles.username}>@{tweet.user.username}</Text>
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
              <Text style={styles.content}>
                {<ParsedContent text={tweet.content} entities={tweet.entities} />}
              </Text>
            </View>

            <Text style={[styles.date]}>{formatDate(tweet.createdAt)}</Text>

            <View
              style={{
                flexDirection: 'row',
                marginVertical: 10
              }}
            >
              <InteractionLabel count={tweet.retwitCount} label={'Retwits'} />
              <InteractionLabel count={tweet.likesCount} label={'Likes'} />
              <InteractionLabel count={tweet.bookmarkCount} label={'Bookmarks'} />
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
              <Interaction
                icon="comment-outline"
                initState={false}
                initCount={undefined}
                handler={async (): Promise<void> => {
                  handlePressComment();
                }}
              />
              <Retwit initState={tweet.userRetwitted} initCount={undefined} twitId={tweet.id} />
              <Like initState={tweet.userLiked} initCount={undefined} twitId={tweet.id} />
              <Bookmark initState={tweet.userBookmarked} initCount={undefined} twitId={tweet.id} />
            </View>
            <Divider style={{ height: 1, width: '100%', backgroundColor: 'rgb(60 60 60)' }} />
            <>
              {comments && comments.length > 0 && (
                <FlatList
                  data={comments}
                  renderItem={({ item }) => <TweetCard item={item} showReply={false} />}
                  keyExtractor={(tweet) => tweet.id}
                />
              )}
            </>
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
                reply={`Replying to @${tweet.user.username}`}
                placeholder={'Post your reply'}
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
                twitContent={tweet.content}
                twitIsFromUser={tweet.user.username === userData?.username}
              />
            </View>
          </Animated.View>
        </>
      ) : (
        <Text
          style={{
            color: 'red',
            alignSelf: 'center',
            fontSize: 20,
            height: '100%',
            textAlignVertical: 'center',
            textAlign: 'center'
          }}
        >
          {error}
        </Text>
      )}
    </View>
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

export default TwitView;
