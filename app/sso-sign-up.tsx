import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';

import ImagePicker from '../components/common/ImagePicker';

import { authenticatedAtom } from './authAtoms/authAtom';
import { UserSSORegisterDto } from './types/authTypes';

const SignUpScreen = () => {
  const { token, uid, providerId, username } =
    useLocalSearchParams<Omit<UserSSORegisterDto, 'birthdate'>>();
  const setAuthAtom = useSetAtom(authenticatedAtom);
  const [birthdate, setBirthdate] = useState('');
  const [usernameInput, setUsernameInput] = useState(username);
  const setBlocked = useSetAtom(blockedAtom);
  const axiosUsers = useAxiosInstance('users');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null); // Estado para la imagen de perfil

  const handleImagePicked = (uri: string) => {
    setProfileImage(uri); // Actualiza el estado con la URI de la imagen seleccionada
  };

  const handleSignUp = useCallback(async () => {
    const authData: UserSSORegisterDto = {
      uid,
      providerId,
      token,
      username: usernameInput,
      birthdate,
      profileImageUrl: profileImage ?? undefined
    };
    try {
      setIsLoading(true);
      const response = await axiosUsers.post(`auth/sso/register`, authData, {
        headers: { 'Content-Type': 'application/json' }
      });
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
  }, [uid, providerId, token, usernameInput, birthdate, axiosUsers, setAuthAtom, setBlocked]);

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Please enter your username and birthdate to complete the registration.
      </Text>
      <Text>Username:</Text>
      <TextInput value={usernameInput} onChangeText={setUsernameInput} style={styles.input} />
      <Text>Birthdate:</Text>
      <TextInput
        value={birthdate}
        onChangeText={setBirthdate}
        style={styles.input}
        placeholder="YYYY-MM-DD"
      />
      <ImagePicker uid={uid} onImagePicked={handleImagePicked} />
      <Button title="Sign Up" onPress={handleSignUp} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 40 // Agrega margen superior para evitar el notch
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  }
});

export default SignUpScreen;
