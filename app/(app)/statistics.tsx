import { useFocusEffect } from 'expo-router';
import { useAtomValue } from 'jotai';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { InteractionAmountData, StatisticsParams } from '@/app/types/statisticType';
import HomeHeader from '@/components/feed/header';
import RangePicker from '@/components/statistics/rangePicker';
import StatisticsChart from '@/components/statistics/statisticsChart';
import useAxiosInstance from '@/hooks/useAxios';

export default function Statistics() {
  const [loadingMoreStatistics, setLoadingMoreStatistics] = useState(false);
  const [likeAmountData, setLikeAmountData] = useState<InteractionAmountData[] | null>(null);
  const [twitAmountData, setTwitAmountData] = useState<InteractionAmountData[] | null>(null);
  const [retwitAmountData, setRetwitAmountData] = useState<InteractionAmountData[] | null>(null);
  const [commentAmountData, setCommentAmountData] = useState<InteractionAmountData[] | null>(null);
  const [value, setValue] = useState('week');

  const timeRangeRef = useRef<'week' | 'month' | 'year'>('week');
  //const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'year'>('week');
  const axiosStatistics = useAxiosInstance('statistics');

  const userData = useAtomValue(authenticatedAtom);
  const username = userData?.username;

  const resetState = () => {
    timeRangeRef.current = 'week';
    setLoadingMoreStatistics(false);
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
        const response = await axiosStatistics.get('metrics/', {
          params: queryParams
        });
        setData(response.data.data);
      } catch (error) {
        console.error(errorMessage, error);
      }
    },
    [axiosStatistics]
  );

  const fetchLikesAmountStatistics = useCallback(async () => {
    fetchStatistics({
      queryParams: { username: username, dateRange: timeRangeRef.current, type: 'like' },
      setData: setLikeAmountData,
      errorMessage: 'Error fetching li kes statistics:'
    });
  }, []);

  const fetchTwitsAmountStatistics = useCallback(async () => {
    fetchStatistics({
      queryParams: { username, dateRange: timeRangeRef.current, type: 'twit' },
      setData: setTwitAmountData,
      errorMessage: 'Error fetching twits statistics:'
    });
  }, []);

  const fetchRetwitsAmountStatistics = useCallback(async () => {
    fetchStatistics({
      queryParams: { username, dateRange: timeRangeRef.current, type: 'retwit' },
      setData: setRetwitAmountData,
      errorMessage: 'Error fetching retwits statistics:'
    });
  }, []);

  const fetchCommentsAmountStatistics = useCallback(async () => {
    fetchStatistics({
      queryParams: { username, dateRange: timeRangeRef.current, type: 'comment' },
      setData: setCommentAmountData,
      errorMessage: 'Error fetching comments statistics:'
    });
  }, []);

  const fetchStatisticsData = useCallback(async () => {
    setLoadingMoreStatistics(true);
    console.log('Loading statistics...');
    try {
      await Promise.all([
        fetchLikesAmountStatistics(),
        fetchTwitsAmountStatistics(),
        fetchRetwitsAmountStatistics(),
        fetchCommentsAmountStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching statistics data:', error);
    } finally {
      setLoadingMoreStatistics(false);
      console.log('Finished loading statistics');
    }
  }, [
    fetchLikesAmountStatistics,
    fetchTwitsAmountStatistics,
    fetchRetwitsAmountStatistics,
    fetchCommentsAmountStatistics
  ]);

  useFocusEffect(
    useCallback(() => {
      resetState();
      fetchStatisticsData();
    }, [])
  );

  const handleTimeRangeChange = (range: 'week' | 'month' | 'year') => {
    timeRangeRef.current = range;
    fetchStatisticsData();
  };
  return (
    <>
      <HomeHeader />
      <View style={styles.container}>
        {!twitAmountData && !likeAmountData && !commentAmountData && !retwitAmountData ? (
          <ActivityIndicator size="large" color="rgb(3, 165, 252)" />
        ) : (
          <>
            <View style={styles.rangeBar}>
              <RangePicker setValue={setValue} value={value} onRangeChange={handleTimeRangeChange} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {/* Barra de selección de rango */}

              {/* Gráficos de estadísticas */}
              <View style={styles.statisticsContainer}>
                <StatisticsChart
                  title="Twits vs Time"
                  data={twitAmountData ?? []}
                  chartType="bar"
                />
                <StatisticsChart
                  title="Retwits vs Time"
                  data={retwitAmountData ?? []}
                  chartType="line"
                />
                <StatisticsChart
                  title="Comments vs Time"
                  data={commentAmountData ?? []}
                  chartType="line"
                />
                <StatisticsChart
                  title="Likes vs Time"
                  data={likeAmountData ?? []}
                  chartType="line"
                />
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)'
  },
  scrollContainer: {
    padding: 15
  },
  rangeBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    marginTop: 30
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
    gap: 20
  },
  placeholder: {
    color: 'rgb(150 150 150)', // Color blanco para el texto del placeholder
    fontSize: 10 // Tamaño de la fuente para el placeholder
  },
  dropDownContainer: {
    backgroundColor: '#222', // Color oscuro para el menú desplegable
    borderColor: '#444', // Color del borde del menú
    borderWidth: 1, // Grosor del borde
    zIndex: 9999 // Asegura que el dropdown esté por encima
  },
  textStyle: {
    color: 'white', // Color blanco para el texto de los ítems del dropdown
    fontSize: 16 // Tamaño de la fuente para los ítems
  },
  arrowIcon: {
    color: 'white',
    transform: [{ scale: 1.5 }] // Ajusta el tamaño con transform
  }
});
