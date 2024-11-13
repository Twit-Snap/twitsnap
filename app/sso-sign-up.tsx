import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';

import ImagePicker from '../components/common/ImagePicker';

import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { authenticatedAtom } from './authAtoms/authAtom';
import { UserSSORegisterDto } from './types/authTypes';

const SignUpScreen = () => {
  const { token, uid, providerId, username, profilePicture } =
    useLocalSearchParams<Omit<UserSSORegisterDto, 'birthdate'>>();
  const setAuthAtom = useSetAtom(authenticatedAtom);
  const [birthdate, setBirthdate] = useState('');
  const [usernameInput, setUsernameInput] = useState(username);
  const setBlocked = useSetAtom(blockedAtom);
  const axiosUsers = useAxiosInstance('users');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profilePictureState, setprofilePictureState] = useState(profilePicture);

  const handleImagePicked = useCallback((uri: string) => {
    setprofilePictureState(uri); // Actualiza el estado con la URI de la imagen seleccionada
  }, []);

  const handleSignUp = useCallback(async () => {
    const expoToken = await registerForPushNotificationsAsync();

    const authData: UserSSORegisterDto = {
      uid,
      providerId,
      token,
      username: usernameInput,
      birthdate,
      profilePicture: profilePictureState ?? undefined
    };
    try {
      setIsLoading(true);
      const response = await axiosUsers.post(
        `auth/sso/register`,
        { ...authData, expoToken },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (response.status === 200) {
        await AsyncStorage.setItem('auth', JSON.stringify(response.data));
        setAuthAtom(response.data);
        setBlocked(false);
        router.replace('/'); // Redirige a la página principal
      }
    } catch (error) {
      console.error('Error en el registro:', JSON.stringify(error, null, 2));

      if (axios.isAxiosError(error)) {
        console.error('ErrorData:', JSON.stringify(error.response?.data, null, 2));
        if (error.response && error.response.status === 409) {
          const existentField = error.response.data['custom-field'];
          alert(`${existentField} already taken. Please try another one.`);
        } else {
          alert('An error occurred. Please try again later.');
        }
      } else {
        alert('An error occurred. Please try again later.');
      }
      setIsLoading(false);
    }
  }, [
    uid,
    providerId,
    token,
    usernameInput,
    birthdate,
    profilePictureState,
    axiosUsers,
    setAuthAtom,
    setBlocked
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Please enter your username and birthdate to complete the registration.
      </Text>
      <TextInput
        label="Username"
        value={usernameInput}
        mode="outlined"
        placeholder="Username"
        onChangeText={setUsernameInput}
        style={styles.input}
        theme={inputTheme}
      />
      <TextInput
        value={birthdate}
        mode="outlined"
        label="Birthdate"
        onChangeText={setBirthdate}
        style={styles.input}
        placeholder="YYYY-MM-DD"
        theme={inputTheme}
      />
      <ImagePicker
        imageUri={profilePictureState}
        username={usernameInput}
        onImagePicked={handleImagePicked}
        onLoadingChange={setIsUploadingPicture}
      />
      <Button
        mode="contained"
        style={styles.button}
        onPress={handleSignUp}
        disabled={isLoading || isUploadingPicture}
      >
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgb(5, 5, 5)',
    paddingTop: 50 // Agrega margen superior para evitar el notch
  },
  input: {
    marginBottom: 12,
    color: 'white'
  },
  instructionText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white'
  },
  button: {
    marginTop: 20,
    backgroundColor: 'rgb(3, 165, 252)'
  }
});

const inputTheme = {
  colors: {
    primary: 'rgb(3, 165, 252)',
    placeholder: 'rgb(113, 118, 123)',
    onSurface: 'white',
    background: 'rgb(5, 5, 5)'
  }
};

export default SignUpScreen;
