import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { TwitSnap } from '@/app/types/TwitSnap';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { useAtomValue } from 'jotai/index';
import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import InspectTweetCard from '@/components/twits/inspectTwitCard';


const TwitView: React.FC = () => {
  const [tweet, setTweet] = useState<TwitSnap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const userData = useAtomValue(authenticatedAtom);
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchTweet = async () => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps/${id}`, {
          headers: { Authorization: `Bearer ${userData?.token}` },
          timeout: 10000
        });
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
}

export default TwitView;