import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import useAxiosInstance from '@/hooks/useAxios';

import { Interest } from './types/authTypes';

const defaultEmoji = '😊'; // Default emoji to use if none is provided

const SignUpInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const axiosInstance = useAxiosInstance('users');

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = (await axiosInstance.get('/public/interests')).data as Interest[];
        setInterests(response);
      } catch (err) {
        setError('Failed to fetch interests');
      } finally {
        setLoading(false);
      }
    };

    !interests.length && fetchInterests();
  }, [axiosInstance, interests.length]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgb(3, 165, 252)" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const handleInterestSelected = (interest: Interest) => {
    if (selectedInterests.some((i) => i.id === interest.id)) {
      setSelectedInterests(selectedInterests.filter((i) => i.id !== interest.id));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Interests</Text>
      <Text style={styles.explanationText}>
        We ask for your interests to improve the content we offer you.
      </Text>
      <View style={styles.badgeContainer}>
        {interests
          .sort((a, b) => (a.parentId ?? 0) - (b.parentId ?? 0))
          .map(
            (interest) =>
              (interest.parentId === null ||
                selectedInterests.some((i) => i.id === interest.parentId)) && (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.badge,
                    selectedInterests.some((i) => i.id === interest.id) && styles.selectedBadge
                  ]}
                  onPress={() => handleInterestSelected(interest)}
                >
                  <Text style={styles.emoji}>{interest.emoji ? interest.emoji : defaultEmoji}</Text>
                  <Text style={styles.badgeText}>{interest.name}</Text>
                </TouchableOpacity>
              )
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: 'rgb(5, 5, 5)'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10
  },
  explanationText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: 'white',
    marginTop: 10
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    fontSize: 18
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  badge: {
    backgroundColor: 'rgb(3, 165, 252)',
    borderRadius: 20,
    padding: 10,
    margin: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedBadge: {
    backgroundColor: 'rgb(255, 79, 56)'
  },
  badgeText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8
  },
  emoji: {
    fontSize: 20 // Adjust size as needed
  },
  noInterestsText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center'
  }
});

export default SignUpInterests;
