import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { TwitSnap } from '@/app/types/TwitSnap';
import InspectTweetCard from '@/components/twits/inspectTwitCard';
import useAxiosInstance from '@/hooks/useAxios';

const TwitView: React.FC = () => {
  const [tweet, setTweet] = useState<TwitSnap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useLocalSearchParams<{ id: string }>();
  const axiosTwits = useAxiosInstance('twits');

  useEffect(() => {
    const fetchTweet = async () => {
      try {
        const response = await axiosTwits.get(`snaps/${id}`);
        console.log(`Fetched twit with id ${id}`);
        setTweet(response.data.data as TwitSnap);
      } catch (error) {
        console.error('Error fetching tweet:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTweet();
    }
  }, [id]);

  if (loading || !tweet) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!tweet) {
    return <Text>Tweet not found</Text>;
  }

  return (
    <View style={{ flex: 1, paddingVertical: 30 }}>
      <InspectTweetCard item={tweet} />
    </View>
  );
};

export default TwitView;
