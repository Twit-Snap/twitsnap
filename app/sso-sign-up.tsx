import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaView } from 'react-native-safe-area-context';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';
import { registerForPushNotificationsAsync } from '@/utils/notifications';

import ImagePicker from '../components/common/ImagePicker';

import { authenticatedAtom } from './authAtoms/authAtom';
import { UserSSORegisterDto } from './types/authTypes';

type SignUpFormField = {
  value: string;
  errorMessage?: string;
};

const SignUpScreen = () => {
  const { token, uid, providerId, username, profilePicture } =
    useLocalSearchParams<Omit<UserSSORegisterDto, 'birthdate'>>();
  const setAuthAtom = useSetAtom(authenticatedAtom);
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [usernameInput, setUsernameInput] = useState(username);
  const [phoneNumber, setPhoneNumber] = useState<SignUpFormField>({ value: '' });
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
      profilePicture: profilePictureState ?? undefined,
      phoneNumber: phoneNumber.value
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
        router.push('./sign-up-location'); // Redirige a la nueva pantalla
      }
    } catch (error) {
      console.error('Error en el registro:', JSON.stringify(error, null, 2));

      if (axios.isAxiosError(error)) {
        console.error('ErrorData:', JSON.stringify(error.response?.data, null, 2));
        if (error.response && error.response.status === 409) {
          const existentField = error.response.data['custom-field'];
          alert(`${existentField} already in use. Please try another one.`);
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
    phoneNumber.value,
    axiosUsers,
    setAuthAtom,
    setBlocked
  ]);

  const validatePhoneNumber = (): boolean => {
    const pattern = /^\+\d{10,12}$/;

    if (!pattern.test(phoneNumber.value)) {
      setPhoneNumber((current) => ({
        ...current,
        errorMessage: 'Please enter a valid phone number'
      }));
      return false;
    }
    return true;
  };

  const handleDateChange = (date: any) => {
    if (date) {
      const dateString = date.date.toISOString().split('T')[0];
      console.log('dateString', dateString);
      setBirthdate(dateString);
    }
    setShowDatePicker(false);
  };

  return (
    <>
      <StatusBar backgroundColor={'rgb(5 5 5)'} barStyle={'light-content'} />
      <SafeAreaView style={{ flex: 1, flexDirection: 'column', backgroundColor: 'rgb(5 5 5)' }}>
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
            onFocus={() => setShowDatePicker(true)}
            style={styles.input}
            placeholder="YYYY-MM-DD"
            theme={inputTheme}
          />
          <DatePickerModal
            locale="en"
            label="Select a date"
            mode="single"
            visible={showDatePicker}
            onDismiss={() => setShowDatePicker(false)}
            date={birthdate ? new Date(birthdate) : undefined}
            onConfirm={handleDateChange}
            validRange={{
              startDate: new Date('1900-01-01'),
              endDate: new Date()
            }}
            startYear={1900}
            endYear={new Date().getFullYear()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              label="Phone number"
              value={phoneNumber.value}
              mode="outlined"
              onChangeText={(value) => setPhoneNumber({ value })}
              onBlur={validatePhoneNumber}
              error={!!phoneNumber.errorMessage}
              placeholder="Phone number"
              theme={inputTheme}
            />
            {phoneNumber.errorMessage && (
              <HelperText padding="none" type="error">
                {phoneNumber.errorMessage}
              </HelperText>
            )}
          </View>
          <ImagePicker
            imageUri={profilePictureState}
            username={usernameInput}
            onImagePicked={handleImagePicked}
            onLoadingChange={setIsUploadingPicture}
          />
          <Button
            mode="contained"
            style={styles.button}
            onPress={() => {
              if (validatePhoneNumber()) {
                handleSignUp();
              }
            }}
            disabled={
              isLoading ||
              isUploadingPicture ||
              birthdate.length === 0 ||
              phoneNumber.value.length === 0
            }
          >
            Sign Up
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgb(5, 5, 5)'
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
  },
  inputContainer: {
    marginBottom: 12
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
