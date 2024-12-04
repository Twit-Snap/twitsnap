import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

import { ModifiableUser } from '@/app/types/publicUser';
import useAxiosInstance from '@/hooks/useAxios';

const EditProfileScreen = () => {
  const { username } = useLocalSearchParams<{ username: string }>();
  const axiosUsers = useAxiosInstance('users');
  const [userData, setUserData] = useState<ModifiableUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosUsers.get(`users/${username}`);
        setUserData(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleInputChange = (field: keyof ModifiableUser, value: string) => {
    if (userData) {
      setUserData({ ...userData, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (userData) {
      try {
        await axiosUsers.put(`users/${username}`, userData);
        // Optionally navigate back or show success message
      } catch (err) {
        console.error(err);
        setError('Failed to update user data');
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          onPress={() => {
            // eslint-disable-next-line no-unused-expressions
            router.canGoBack() ? router.back() : router.replace(`/profile/${username}`);
          }}
        />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Button mode="contained" onPress={handleSubmit} style={styles.headerButton}>
          Save
        </Button>
      </View>
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: userData?.profilePicture || 'default_image_url' }}
          style={styles.profileImage}
        />
        <TextInput
          style={styles.input}
          placeholder="Background Picture URL"
          value={userData?.backgroundPicture || ''}
          onChangeText={(value) => handleInputChange('backgroundPicture', value)}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={userData?.name || ''}
        onChangeText={(value) => handleInputChange('name', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={userData?.lastname || ''}
        onChangeText={(value) => handleInputChange('lastname', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Birthdate (YYYY-MM-DD)"
        value={userData?.birthdate || ''}
        onChangeText={(value) => handleInputChange('birthdate', value)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgb(5, 5, 5)'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'gray'
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold'
  },
  headerButton: {
    borderRadius: 10,
    backgroundColor: 'rgb(3, 165, 252)'
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: 20
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    color: 'white',
    backgroundColor: 'rgb(30, 30, 30)'
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20
  }
});

export default EditProfileScreen;
