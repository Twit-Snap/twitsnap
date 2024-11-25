import { useFocusEffect } from 'expo-router';
import { useAtomValue } from 'jotai';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import useAxiosInstance from '@/hooks/useAxios';

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


  const [isActualStatisticsTypeTwit, setctualStatisticsTypeTwit] = useState(true);

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
          setctualStatisticsTypeTwit(true);
          await fetchTwitsStatisticsData();
        },
        state: true
      },
      {
        text: 'Account',
        handler: async () => {
          resetState();
          setctualStatisticsTypeTwit(false);
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
    setLikeAmountData(null);
    setTwitAmountData(null);
    setRetwitAmountData(null);
    setCommentAmountData(null);
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
      setLoadingMoreStatistics(true);
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
      setLoadingMoreStatistics(true);
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
    await fetchAllTwitsInteraction()
      .catch((error) => {
        console.error('Error fetching statistics data:', error);
      })
      .finally(() => {
        setLoadingMoreStatistics(false);
        setShowRangePicker(true);
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isActualStatisticsTypeTwit) {
        fetchTwitsStatisticsData();
      } else {
        fetchAccountStatistics({
          queryParams: { username, dateRange: timeRangeRef.current, type: 'follow' }
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isActualStatisticsTypeTwit, username]);


  const handleTimeRangeChange = async (range: 'week' | 'month' | 'year') => {
    timeRangeRef.current = range;
    if (isActualStatisticsTypeTwit) {
      await fetchTwitsStatisticsData();
    } else {
      await fetchAccountStatistics({
        queryParams: { username, dateRange: timeRangeRef.current, type: 'follow' }
      });
    }
  };

  const renderTwitStatistics = () =>
    loadingMoreStatistics ? (
      <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} style={{ marginTop: 30 }} />
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
      <ActivityIndicator size={60} color={'rgb(3, 165, 252)'} style={{ marginTop: 30 }} />
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
    paddingTop: 40
  },
  rangeBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
    marginTop: 40
  },
  picker: {
    backgroundColor: 'rgb(28,28,28)',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 20
  },
  dropdown: {
    backgroundColor: 'rgb(20 20 20)', // Fondo del menú desplegable
    borderRadius: 10
  },
  itemStyle: {
    backgroundColor: 'rgb(150 150 150)', // Fondo de cada ítem del dropdown
    color: 'white' // Color del texto de cada ítem
  },
  dropdownContainer: {
    height: 10,
    width: '80%',
    backgroundColor: 'rgb(20, 20, 20)',
    borderRadius: 30,
    zIndex: 1000
  },
  dropdownList: {
    backgroundColor: 'rgb(30, 30, 30)',
    borderRadius: 10
  },
  statisticsContainer: {
    gap: 20,
    flex: 1
  },
  placeholder: {
    color: 'rgb(150 150 150)', // Color blanco para el texto del placeholder
    fontSize: 10 // Tamaño de la fuente para el placeholder
  },
  dropDownContainer: {
    backgroundColor: '#222',
    borderColor: '#444',
    borderWidth: 1,
    zIndex: 9999, // Asegura que el dropdown esté por encima
  },
  textStyle: {
    color: 'white', // Color blanco para el texto de los ítems del dropdown
    fontSize: 16 // Tamaño de la fuente para los ítems
  },
  arrowIcon: {
    color: 'white',
    transform: [{ scale: 1.5 }] // Ajusta el tamaño con transform
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
