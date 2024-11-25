import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  TextInput as RNTextInput,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Button, IconButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';
import { registerForPushNotificationsAsync } from '@/utils/notifications';

import { authenticatedAtom } from './authAtoms/authAtom';

const window = Dimensions.get('window');

interface signInForm {
  emailOrUsername: string;
  password: string;
  loginTime: number;
}

const SignIn: () => React.JSX.Element = () => {
  const [, setIsAuthenticated] = useAtom(authenticatedAtom);
  const setBlocked = useSetAtom(blockedAtom);
  const axiosUsers = useAxiosInstance('users');
  const [next, setNext] = useState<boolean>(false);
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const emailOrUsernameRef = useRef<RNTextInput | null>(null);
  const passwordRef = useRef<RNTextInput | null>(null);
  const [entryTime, setEntryTime] = useState<Date>(new Date());

  const [form, setForm] = useState<signInForm>({
    emailOrUsername: '',
    password: '',
    loginTime: 0
  });

  const calculateEventTime = () => {
    const now = new Date();
    return now.getTime() - entryTime.getTime();
  };

  const handleChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value
    });
  };

  const closeInput = () => {
    Keyboard.dismiss();
    emailOrUsernameRef.current?.blur();
    passwordRef.current?.blur();
  };

  const handleNext = () => {
    closeInput();

    if (form.emailOrUsername.length === 0) {
      setError('Please enter a valid username.');
      return;
    }

    setNext(true);
  };

  const areValidFields = () => {
    if (form.emailOrUsername.length === 0) {
      setError('Please enter a valid username.');
      return false;
    }

    if (form.password.length === 0) {
      setError('Please enter a valid password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    closeInput();

    if (!areValidFields()) {
      return;
    }

    const timeSpent = calculateEventTime();

    const expoToken = await registerForPushNotificationsAsync();

    try {
      const response = await axiosUsers.post(
        `auth/login`,
        { ...form, expoToken, loginTime: timeSpent },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem('auth', JSON.stringify(response.data));
        setIsAuthenticated(response.data);
        setBlocked(false);
        console.log('Login success: ', response.data);
        router.replace('/');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.log('Login failed: ', error.response.data);
        setError('Invalid username or password');
      } else if (error.response?.status === 403) {
        console.log('User blocked');
      } else {
        console.error('Error:', JSON.stringify(error, null, 2));
        setError('An error occurred. Please try again later.');
      }
    }
    setEntryTime(new Date());
  };

  const handleForgotPassword = useCallback(() => {
    router.push('/forgot-password');
  }, []);

  return (
    <>
      <StatusBar backgroundColor={'rgb(5 5 5)'} barStyle={'light-content'} />
      <TouchableWithoutFeedback onPress={closeInput}>
        <SafeAreaView style={{ flex: 1, flexDirection: 'column', backgroundColor: 'rgb(5 5 5)' }}>
          <View style={styles.header}>
            <IconButton icon="close" size={24} onPress={router.back} iconColor="white" />
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.container}>
            <Text
              style={{
                marginVertical: 10,
                fontWeight: 'bold',
                fontSize: 26,
                color: 'white',
                lineHeight: 30
              }}
            >
              {next
                ? 'Enter your password'
                : 'To get started, first enter your email, or @username'}
            </Text>
            <TextInput
              value={form.emailOrUsername}
              onChangeText={(value) => handleChange('emailOrUsername', value)}
              style={styles.input}
              mode="outlined"
              label="Email or username"
              ref={emailOrUsernameRef}
              theme={{
                colors: {
                  background: 'rgb(5 5 5)',
                  onSurfaceVariant:
                    error && form.emailOrUsername.length === 0 ? 'rgb(255 100 100)' : 'white'
                }
              }}
              outlineColor={
                error && form.emailOrUsername.length === 0 ? 'rgb(255 100 100)' : 'rgb(100 100 100)'
              }
              activeOutlineColor={
                error && form.emailOrUsername.length === 0 ? 'rgb(255 100 100)' : 'rgb(3, 165, 252)'
              }
              contentStyle={{ color: 'white' }}
              selectionColor="rgb(3 165 252)"
              cursorColor="white"
              onFocus={() => setError('')}
            />
            {next && (
              <TextInput
                value={form.password}
                onChangeText={(value) => handleChange('password', value)}
                style={styles.input}
                mode="outlined"
                label="Password"
                right={
                  <TextInput.Icon
                    icon={hidePassword ? 'eye-outline' : 'eye-off-outline'}
                    onPress={() => setHidePassword(!hidePassword)}
                    color={
                      error && form.password.length === 0 ? 'rgb(255 100 100)' : 'rgb(100 100 100)'
                    }
                    size={25}
                  />
                }
                secureTextEntry={hidePassword}
                theme={{
                  colors: {
                    background: 'rgb(5 5 5)',
                    onSurfaceVariant:
                      error && form.password.length === 0 ? 'rgb(255 100 100)' : 'white'
                  }
                }}
                outlineColor={
                  error && form.password.length === 0 ? 'rgb(255 100 100)' : 'rgb(100 100 100)'
                }
                activeOutlineColor={
                  error && form.password.length === 0 ? 'rgb(255 100 100)' : 'rgb(3, 165, 252)'
                }
                contentStyle={{ color: 'white' }}
                selectionColor="rgb(3 165 252)"
                cursorColor="white"
                onFocus={() => setError('')}
              />
            )}
            {error && (
              <Text
                style={{
                  color: 'rgb(255 100 100)',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {error}
              </Text>
            )}
          </View>
          <View style={styles.footer}>
            <Button
              labelStyle={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
                lineHeight: 16,
                marginBottom: 1
              }}
              buttonColor="rgb(5 5 5)"
              style={{ borderWidth: 1, borderColor: 'rgb(80 80 80)', height: 35 }}
              onPress={() => handleForgotPassword()}
            >
              Forgot password?
            </Button>
            <Button
              labelStyle={{
                color: 'black',
                fontWeight: 'bold',
                fontSize: 16,
                lineHeight: 16,
                marginBottom: 1
              }}
              buttonColor="white"
              style={{ borderWidth: 1, borderColor: 'rgb(5 5 5)', height: 35, width: 80 }}
              onPress={next ? handleSubmit : handleNext}
            >
              {next ? 'Log in' : 'Next'}
            </Button>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  logoContainer: {
    left: window.width / 2 - 129
  },
  logo: {
    width: 150,
    height: 50
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 60,
    minWidth: window.width,
    maxWidth: window.width
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 60,
    minWidth: window.width,
    maxWidth: window.width,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  input: {
    marginBottom: 25,
    marginTop: 10
  }
});

export default SignIn;
