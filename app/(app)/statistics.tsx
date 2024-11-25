import { useFocusEffect } from 'expo-router';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import {
  AccountInteractionData,
  InteractionAmountData,
  StatisticsParams
} from '@/app/types/statisticType';
import FeedType, { IFeedTypeProps } from '@/components/feed/feed_type';
import RangePicker from '@/components/statistics/rangePicker';
import StatisticsChart from '@/components/statistics/statisticsChart';
import useAxiosInstance, { intervals } from '@/hooks/useAxios';

export default function Statistics() {
  const [loadingMoreStatistics, setLoadingMoreStatistics] = useState(true);
  const [likeAmountData, setLikeAmountData] = useState<InteractionAmountData[] | null>(null);
  const [twitAmountData, setTwitAmountData] = useState<InteractionAmountData[] | null>(null);
  const [retwitAmountData, setRetwitAmountData] = useState<InteractionAmountData[] | null>(null);
  const [commentAmountData, setCommentAmountData] = useState<InteractionAmountData[] | null>(null);
  const [followAmountData, setFollowAmountData] = useState<AccountInteractionData | null>(null);
  const [value, setValue] = useState(null);
  const [open, setOpen] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const isActualStatisticsTypeTwitRef = useRef(true);
  const [isActualStatisticsTypeTwit, setActualStatisticsTypeTwit] = useState(true);
  const [initialTab, setInitialTab] = useState(true);

  const timeRangeRef = useRef<'week' | 'month' | 'year'>('week');
  const axiosStatistics = useAxiosInstance('statistics');

  const userData = useAtomValue(authenticatedAtom);
  const username = userData?.username;

  const statisticsTypes: IFeedTypeProps = {
    items: [
      {
        text: 'Twits',
        handler: async () => {
          resetState();
          setActualStatisticsTypeTwit(true);
          isActualStatisticsTypeTwitRef.current = true;
          await fetchTwitsStatisticsData();
        },
        state: true
      },
      {
        text: 'Account',
        handler: async () => {
          resetState();
          setActualStatisticsTypeTwit(false);
          isActualStatisticsTypeTwitRef.current = false;
          setLoadingMoreStatistics(true);
          await fetchAccountStatistics({
            queryParams: { username, dateRange: timeRangeRef.current, type: 'follow' }
          });
        },
        state: false
      }
    ]
  };

  const resetState = () => {
    timeRangeRef.current = 'week';
    setLoadingMoreStatistics(true);
    setValue(null);
    setOpen(false);
    setShowRangePicker(false);
  };

  const fetchStatistics = async ({
    queryParams,
    setData,
    errorMessage
  }: {
    queryParams: StatisticsParams;
    setData: React.Dispatch<React.SetStateAction<InteractionAmountData[] | null>>;
    errorMessage: string;
  }) => {
    try {
      const response = await axiosStatistics.get('metrics/', {
        params: queryParams
      });
      setData(response.data.data);
    } catch (error) {
      console.error(errorMessage, error);
    }
  };
  const fetchAccountStatistics = async ({ queryParams }: { queryParams: StatisticsParams }) => {
    try {
      console.log('fetching account statistics');
      const response = await axiosStatistics.get('metrics/', {
        params: queryParams
      });
      setFollowAmountData(response.data.data);
    } catch (error) {
      console.error('Error fetching follow statistics:', error);
    } finally {
      setLoadingMoreStatistics(false);
      setShowRangePicker(true);
    }
  };

  const fetchLikesAmountStatistics = async () => {
    await fetchStatistics({
      queryParams: { username: username, dateRange: timeRangeRef.current, type: 'like' },
      setData: setLikeAmountData,
      errorMessage: 'Error fetching likes statistics:'
    });
  };

  const fetchTwitsAmountStatistics = async () => {
    await fetchStatistics({
      queryParams: { username, dateRange: timeRangeRef.current, type: 'twit' },
      setData: setTwitAmountData,
      errorMessage: 'Error fetching twits statistics:'
    });
  };

  const fetchRetwitsAmountStatistics = async () => {
    await fetchStatistics({
      queryParams: { username, dateRange: timeRangeRef.current, type: 'retwit' },
      setData: setRetwitAmountData,
      errorMessage: 'Error fetching retwits statistics:'
    });
  };

  const fetchCommentsAmountStatistics = async () => {
    await fetchStatistics({
      queryParams: { username, dateRange: timeRangeRef.current, type: 'comment' },
      setData: setCommentAmountData,
      errorMessage: 'Error fetching comments statistics:'
    });
  };

  const fetchAllTwitsInteraction = async () => {
    await fetchLikesAmountStatistics();
    await fetchTwitsAmountStatistics();
    await fetchRetwitsAmountStatistics();
    await fetchCommentsAmountStatistics();
  };

  const fetchTwitsStatisticsData = async () => {
    setLoadingMoreStatistics(true);
    console.log('fetching twits statistics');
    await fetchAllTwitsInteraction()
      .catch((error) => {
        console.error('Error fetching statistics data:', error);
      })
      .finally(() => {
        setLoadingMoreStatistics(false);
        setShowRangePicker(true);
      });
  };

  const refreshTwitStatitics = async () => {
    await fetchAllTwitsInteraction().catch((error) => {
      console.error('Error fetching statistics data:', error);
    });
  };

  const refreshAccountStatistics = async () => {
    await fetchAccountStatistics({
      queryParams: { username, dateRange: timeRangeRef.current, type: 'follow' }
    });
  };

  const refreshStatistics = async () => {
    console.log('is twit statistics', isActualStatisticsTypeTwitRef.current);
    if (isActualStatisticsTypeTwitRef.current) {
      await refreshTwitStatitics();

      console.log('refreshing twit statistics');
    } else {
      await refreshAccountStatistics();
      console.log('refreshing account statistics');
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log(statisticsTypes.items[0].state);
      console.log(statisticsTypes.items[1].state);
      resetState();
      setActualStatisticsTypeTwit(true);
      isActualStatisticsTypeTwitRef.current = true;

      fetchTwitsStatisticsData();

      const interval = setInterval(() => {
        refreshStatistics();
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    }, [])
  );

  const handleTimeRangeChange = async (range: 'week' | 'month' | 'year') => {
    timeRangeRef.current = range;
    if (isActualStatisticsTypeTwit) {
      await fetchTwitsStatisticsData();
    } else {
      setLoadingMoreStatistics(true);
      await fetchAccountStatistics({
        queryParams: { username, dateRange: timeRangeRef.current, type: 'follow' }
      });
    }
  };

  const renderTwitStatistics = () =>
    loadingMoreStatistics ? (
      <>
        <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} style={{ marginTop: 30 }} />
        <View style={styles.emptySpaceLoading} />
      </>
    ) : (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statisticsContainer}>
          <StatisticsChart title="Twits vs Time" data={twitAmountData ?? []} chartType="line" />
          <StatisticsChart title="Retwits vs Time" data={retwitAmountData ?? []} chartType="line" />
          <StatisticsChart
            title="Comments vs Time"
            data={commentAmountData ?? []}
            chartType="line"
          />
          <StatisticsChart title="Likes vs Time" data={likeAmountData ?? []} chartType="line" />
        </View>
      </ScrollView>
    );

  const renderAccountStatistics = () =>
    loadingMoreStatistics ? (
      <>
        <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} style={{ marginTop: 30 }} />
        <View style={styles.emptySpace} />
      </>
    ) : (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statisticsContainer}>
          {/* Seguidores Totales */}
          <View style={styles.totalFollowersContainer}>
            <Text style={styles.totalFollowersText}>
              Total Followers: {followAmountData?.totalFollowers ?? 0}
            </Text>
          </View>
          <StatisticsChart
            title="Follows vs Time"
            data={followAmountData?.follows ?? []}
            chartType="line"
          />
        </View>
        <View style={styles.emptySpace} />
      </ScrollView>
    );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Statistics</Text>
        </View>
        <FeedType {...statisticsTypes} />

        {/* Agrupa RangePicker y estadísticas */}
        {showRangePicker && (
          <View style={styles.rangeBar}>
            <RangePicker
              setValue={setValue}
              value={value}
              onRangeChange={handleTimeRangeChange}
              open={open}
              setOpen={setOpen}
            />
          </View>
        )}
        {/* Renderizado de estadísticas */}
        {isActualStatisticsTypeTwit ? renderTwitStatistics() : renderAccountStatistics()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)',
    alignContent: 'flex-start'
  },
  emptySpace: {
    height: 550,
    backgroundColor: 'rgb(5 5 5)'
  },
  emptySpaceLoading: {
    height: 560,
    backgroundColor: 'rgb(5 5 5)'
  },
  titleContainer: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 15
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  scrollContainer: {
    padding: 15,
    paddingTop: 20
  },
  rangeBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    marginTop: 40
  },
  statisticsContainer: {
    gap: 20,
    flex: 1
  },
  textStyle: {
    color: 'white', // Color blanco para el texto de los ítems del dropdown
    fontSize: 16 // Tamaño de la fuente para los ítems
  },

  totalFollowersContainer: {
    marginBottom: 10,
    alignItems: 'center'
  },
  totalFollowersText: {
    color: 'white', // Texto blanco para contraste
    fontSize: 16,
    fontWeight: 'bold'
  }
});
