import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button } from 'react-native-paper';

import useAxiosInstance from '@/hooks/useAxios';

import { Interest } from './types/authTypes';

const SignUpInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const axiosInstance = useAxiosInstance('users');

  const fetchInterests = useCallback(async () => {
    try {
      const response = (await axiosInstance.get('/public/interests')).data as Interest[];
      setInterests(response);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  useEffect(() => {
    !interests.length && fetchInterests();
  }, [fetchInterests, interests.length]);

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
        <Text style={styles.errorText}>Oops! Something went wrong.</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Text style={styles.errorSuggestion}>
          Please check your internet connection and try again.
        </Text>
        <Button
          mode="contained"
          onPress={() => {
            setError(null); // Clear the error
            setSelectedInterests([]);
            fetchInterests(); // Retry fetching interests
          }}
          style={styles.retryButton}
        >
          Retry
        </Button>
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

  const handleSaveInterests = async () => {
    try {
      await axiosInstance.post('/users/interests', {
        interests: selectedInterests.map((interest) => interest.id)
      });
      console.log('Interests saved successfully');
      router.replace('/home');
    } catch (err) {
      console.error(err);
      setError('Failed to save interests');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Interests</Text>
      <Text style={styles.explanationText}>
        We ask for your interests to improve the content we offer you.
      </Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.badgeContainer}>
          {interests
            .sort((a, b) => (a.parentId ?? 0) - (b.parentId ?? 0))
            .map(
              (interest) =>
                // If the interest is a parent or a child that has been selected or is a child of a
                // selected interest, show it
                (interest.parentId === null ||
                  selectedInterests.some(
                    (i) => i.id === interest.parentId || i.id === interest.id
                  )) && (
                  <TouchableOpacity
                    key={interest.id}
                    style={[
                      styles.badge,
                      selectedInterests.some((i) => i.id === interest.id) && styles.selectedBadge
                    ]}
                    onPress={() => handleInterestSelected(interest)}
                  >
                    <Text style={styles.emoji}>{interest.emoji ?? ''}</Text>
                    <Text style={styles.badgeText}>{interest.name}</Text>
                  </TouchableOpacity>
                )
            )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          labelStyle={{
            color: selectedInterests.length === 0 ? 'gray' : 'black',
            fontWeight: 'bold',
            fontSize: 16,
            lineHeight: 16,
            marginBottom: 1
          }}
          disabled={selectedInterests.length === 0}
          buttonColor={selectedInterests.length === 0 ? 'rgba(255, 255, 255, 0.5)' : 'white'}
          style={{
            borderWidth: 1,
            borderColor: 'rgb(5 5 5)',
            height: 35,
            width: 80,
            opacity: selectedInterests.length === 0 ? 0.5 : 1
          }}
          onPress={handleSaveInterests}
        >
          {'Save'}
        </Button>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgb(5, 5, 5)'
  },
  errorText: {
    color: 'red',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  errorMessage: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10
  },
  errorSuggestion: {
    color: 'gray',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: 'rgb(3, 165, 252)',
    padding: 10,
    borderRadius: 5
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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10
  },
  scrollView: {
    flexGrow: 1
  }
});

export default SignUpInterests;
