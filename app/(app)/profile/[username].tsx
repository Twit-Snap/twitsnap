import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { ErrorUser, SearchedUser } from '@/app/types/publicUser';
import { InteractionAmountData, StatisticsParams } from '@/app/types/statisticType';
import { TwitSnap } from '@/app/types/TwitSnap';
import { tweetDeleteAtom } from '@/atoms/deleteTweetAtom';
import FeedType, { IFeedTypeProps } from '@/components/feed/feed_type';
import ProfileHeader from '@/components/profile/ProfileHeader';
import TweetCard from '@/components/twits/TweetCard';
import useAxiosInstance from '@/hooks/useAxios';

import StatisticsChart from './components/statisticsChart';

export default function PublicProfileScreen() {
  const [fetchDeletedTwits, setDeletedTwits] = useAtom(tweetDeleteAtom);

  const { username } = useLocalSearchParams<{ username: string }>();

  const [searchUserData, setSearchUserData] = useState<SearchedUser | ErrorUser | null>(null);
  const [twits, setTwits] = useState<TwitSnap[] | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTwits, setHasMoreTwits] = useState(true);
  const axiosUsers = useAxiosInstance('users');
  const axiosTwits = useAxiosInstance('twits');
  const axiosStatistics = useAxiosInstance('statistics');
  const isActualFeedTypeTwit = useRef<boolean>(true);
  const isBookmarksSection = useRef<boolean>(false);
  const [twitAmountData, setTwitAmountData] = useState<InteractionAmountData[] | null>(null);
  const [retwitAmountData, setRetwitAmountData] = useState<InteractionAmountData[] | null>(null);
  const [likeAmountData, setLikeAmountData] = useState<InteractionAmountData[] | null>(null);
  const [commentAmountData, setCommentAmountData] = useState<InteractionAmountData[] | null>(null);
  const [isStatisticsSection, setIsStatisticsSection] = useState(false);

  const resetState = () => {
    setLoadingMore(false);
    setHasMoreTwits(true);
    setTwits(null);
  };

  const twitTypes: IFeedTypeProps = {
    items: [
      {
        text: 'Twits',
        handler: async () => {
          resetState();
          isActualFeedTypeTwit.current = true;
          isBookmarksSection.current = false;
          setIsStatisticsSection(false);
          fetchTweets();
        },
        state: true
      },
      {
        text: 'Retwits',
        handler: async () => {
          resetState();
          isActualFeedTypeTwit.current = false;
          isBookmarksSection.current = false;
          setIsStatisticsSection(false);
          fetchTweets();
        },
        state: false
      },
      {
        text: 'Bookmarks',
        handler: async () => {
          resetState();
          isBookmarksSection.current = true;
          setIsStatisticsSection(false);
          fetchTweets();
        },
        state: false
      },
      {
        text: 'Statistics',
        handler: async () => {
          resetState();
          isActualFeedTypeTwit.current = false;
          isBookmarksSection.current = false;
          setIsStatisticsSection(true);
          fetchStatisticsData();
        },
        state: false
      }
    ]
  };

  const fetchStatistics = useCallback(
    async ({
      queryParams,
      setData,
      errorMessage
    }: {
      queryParams: StatisticsParams;
      setData: React.Dispatch<React.SetStateAction<InteractionAmountData[] | null>>;
      errorMessage: string;
    }) => {
      try {
        setLoadingMore(true);
        const response = await axiosStatistics.get('metrics/', {
          params: queryParams
        });
        setData(response.data.data);
      } catch (error) {
        console.error(errorMessage, error);
      } finally {
        setLoadingMore(false);
      }
    },
    [axiosStatistics]
  );

  const fetchLikesAmountStatistics = useCallback(() => {
    fetchStatistics({
      queryParams: { type: 'like', username },
      setData: setLikeAmountData,
      errorMessage: 'Error fetching likes statistics:'
    });
  }, [fetchStatistics, username]);

  const fetchTwitsAmountStatistics = useCallback(() => {
    fetchStatistics({
      queryParams: { type: 'twit', username },
      setData: setTwitAmountData,
      errorMessage: 'Error fetching twits statistics:'
    });
  }, [fetchStatistics, username]);

  const fetchRetwitsAmountStatistics = useCallback(() => {
    fetchStatistics({
      queryParams: { type: 'retwit', username },
      setData: setRetwitAmountData,
      errorMessage: 'Error fetching retwits statistics:'
    });
  }, [fetchStatistics, username]);

  const fetchCommentsAmountStatistics = useCallback(() => {
    fetchStatistics({
      queryParams: { type: 'comment', username },
      setData: setCommentAmountData,
      errorMessage: 'Error fetching comments statistics:'
    });
  }, [fetchStatistics, username]);

  const fetchStatisticsData = useCallback(() => {
    fetchLikesAmountStatistics();
    fetchTwitsAmountStatistics();
    fetchRetwitsAmountStatistics();
    fetchCommentsAmountStatistics();
  }, [
    fetchCommentsAmountStatistics,
    fetchLikesAmountStatistics,
    fetchRetwitsAmountStatistics,
    fetchTwitsAmountStatistics
  ]);
  const fetchUserData = useCallback(async () => {
    try {
      console.log('fetchUserData', username);
      const response = await axiosUsers.get(`users/${username}`);
      setSearchUserData(response.data.data);
    } catch (error: any) {
      if (error.status === 404) {
        setSearchUserData({
          name: 'This account does not exist!',
          username: username,
          description: 'Please try another search'
        });
      } else {
        setSearchUserData({
          name: 'Something went wrong!',
          username: username,
          description: 'Please try again later'
        });
      }
    }
  }, [username]);

  // Cargar tweets, con soporte de paginación
  const fetchTweets = useCallback(
    async (olderTwits = false) => {
      if (!hasMoreTwits || !username) return;

      const lastTwit = twits ? (olderTwits ? twits[twits.length - 1] : undefined) : undefined;
      const queryParams = lastTwit
        ? {
            createdAt: lastTwit.createdAt,
            older: true,
            limit: 20,
            username: username,
            type: isActualFeedTypeTwit.current ? '["comment","original"]' : '["retwit"]',
            bookmarks: isBookmarksSection.current
          }
        : {
            limit: 20,
            username: username,
            type: isActualFeedTypeTwit.current ? '["comment","original"]' : '["retwit"]',
            bookmarks: isBookmarksSection.current
          };

      try {
        setLoadingMore(true);

        const response = await axiosTwits.get(`snaps/`, {
          params: queryParams
        });
        const newTwits = response.data.data;

        if (newTwits.length === 0) {
          if (fetchDeletedTwits.shouldDelete) {
            setTwits((prevTwits) => {
              const twits =
                prevTwits?.filter((twit) => !fetchDeletedTwits.twitId.includes(twit.id)) ?? [];
              setDeletedTwits({ shouldDelete: false, twitId: [] });
              return twits;
            });
          }
          setHasMoreTwits(false);
        } else {
          setTwits((prevTwits) => {
            let twits = [...(prevTwits ?? []), ...newTwits];
            if (fetchDeletedTwits.shouldDelete) {
              twits = twits.filter((twit) => !fetchDeletedTwits.twitId.includes(twit._id));
              setDeletedTwits({ shouldDelete: false, twitId: [] });
            }
            return twits;
          });
        }
      } catch (error) {
        console.error('Error fetching tweets:', error);
      } finally {
        setLoadingMore(false);
      }
    },
    [hasMoreTwits, twits, username]
  );

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        resetState();
        isActualFeedTypeTwit.current = true;
        await fetchUserData();
        await fetchTweets();
      };

      fetchData();

      return () => {
        setSearchUserData(null);
        resetState();
        isActualFeedTypeTwit.current = true;
      };
    }, [fetchUserData])
  );

  const handleScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { nativeEvent } = event;
    if (
      nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
        nativeEvent.contentSize.height - 20 &&
      !loadingMore
    ) {
      await fetchTweets(true);
    }
  };

  if (!searchUserData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={styles.scrollViewContent}
      >
        <>
          <ProfileHeader user={searchUserData as SearchedUser} />
          <View style={styles.divider} />
        </>

        {/* Renderiza el componente FeedType con los datos de las pestañas */}
        <FeedType {...twitTypes} />

        {isStatisticsSection ? (
          <View style={styles.statisticsContainer}>
            <Text style={styles.statisticTitle}>Statistics</Text>
            <StatisticsChart title="Amount of Twits" data={twitAmountData ?? []} chartType="bar" />
            <StatisticsChart title="Amount of Retwits" data={retwitAmountData ?? []} chartType="line" />
            <StatisticsChart title="Amount of Comments" data={commentAmountData ?? []} chartType="line" />
            <StatisticsChart title="Amount of Likes" data={likeAmountData ?? []} chartType="line" />
          </View>
        ) : twits ? (
          twits.length > 0 ? (
            <FlatList<TwitSnap>
              style={{ marginTop: 5 }}
              data={twits}
              renderItem={({ item }) => <TweetCard item={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noTwitsText}>No tweets available</Text>
          )
        ) : (
          <></>
        )}

        {loadingMore && <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)'
  },
  scrollViewContent: {
    justifyContent: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(5 5 5)'
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40
  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginTop: 10
  },
  noTwitsText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40
  },
  statisticsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgb(15 15 15)', // Fondo ligeramente más claro para las estadísticas
    borderRadius: 10
  },
  statisticTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15
  },
  chart: {
    marginTop: 20,
    borderRadius: 16
  },
  chartTitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10
  }
});
