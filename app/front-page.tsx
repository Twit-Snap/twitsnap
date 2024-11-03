import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import axios, { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { authenticatedAtom } from './authAtoms/authAtom';
import { UserSSORegisterDto } from './types/authTypes';
import React from 'react';

GoogleSignin.configure({
  webClientId: '224360780470-maj4ma0cdjlm1o2376lv28m45rvm2e8e.apps.googleusercontent.com'
});
const window = Dimensions.get('window');

export default function FrontPage() {
  const [authAtom, setAuthAtom] = useAtom(authenticatedAtom);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isInProgress, setIsInProgress] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      if (!authAtom) {
        const session: string | null = await AsyncStorage.getItem('auth');
        // const session: string | null = null; //To test sign in

        if (!session) {
          setIsLoadingSession(false);
          return;
        }

        setAuthAtom(JSON.parse(session));
        router.replace('/');
      } else {
        setIsLoadingSession(false);
      }
    };

    loadAuth();
  }, [authAtom, setAuthAtom]);

  const handleDirectGoogleLogin = useCallback(
    async (userCreds: FirebaseAuthTypes.UserCredential, token: string) => {
      const { uid } = userCreds.user;
      const authData = {
        uid,
        token
      };
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}auth/sso/login`,
          authData,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        if (response.status === 200) {
          await AsyncStorage.setItem('auth', JSON.stringify(response.data));
          setAuthAtom(response.data);
          router.replace('/');
        }
      } catch (error) {
        const errorAux = error as AxiosError;
        if (errorAux.response && errorAux.response.status === 401) {
          console.log('Login failed: ', errorAux.response.data);
          alert('Invalid username or password');
        } else {
          console.error('Error:', JSON.stringify(errorAux, null, 2));
          console.error('Error data:', JSON.stringify(errorAux.response?.data, null, 2));
          alert('An error occurred. Please try again later.');
        }
      }
    },
    [setAuthAtom]
  );

  const navigateToSsoSignUp = (userCreds: FirebaseAuthTypes.UserCredential, token: string) => {
    const params: Omit<UserSSORegisterDto, 'birthdate'> = {
      uid: userCreds.user.uid,
      token,
      providerId: userCreds.additionalUserInfo?.providerId || '',
      username: userCreds.user.email?.split('@')[0] || ''
    };
    router.push({
      pathname: '/sso-sign-up',
      params
    });
  };

  const handleSuccessGoogleSignIn = useCallback(
    async (userCreds: FirebaseAuthTypes.UserCredential, token: string) => {
      if (userCreds.additionalUserInfo?.isNewUser) {
        navigateToSsoSignUp(userCreds, token);
        return;
      }
      handleDirectGoogleLogin(userCreds, token);
    },
    [handleDirectGoogleLogin]
  );

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsInProgress(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        const credential = auth.GoogleAuthProvider.credential(idToken);
        const userCredential = await auth().signInWithCredential(credential);

        // Get the Firebase ID token
        const firebaseIdToken = await userCredential.user.getIdToken();

        handleSuccessGoogleSignIn(userCredential, firebaseIdToken!);
      } else {
        // sign in was cancelled by user
        console.log('signin cancelled');
      }
    } catch (error) {
      console.error(error);
      console.error(JSON.stringify(error, null, 2));
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log('Signin already progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.error('Play services not available');
            break;
          default:
            console.error('Unhandled error code', error);
        }
      } else {
        console.error('Unknown error', error);
      }
    }
    setIsInProgress(false);
  }, [handleSuccessGoogleSignIn]);

  return (
    <>
      {isLoadingSession ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.container}>
          <Text
            style={{
              fontSize: 35,
              fontWeight: '300',
              textAlign: 'center',
              marginBottom: 10,
              marginVertical: 10
            }}
          >
            Everything you love about Twitter,
          </Text>
          <Text style={{ fontSize: 60, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
            but better.
          </Text>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo_light.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.buttonContainer}>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}
            >
              Already have an account?
            </Text>
            <Button
              icon="account-outline"
              mode="contained"
              buttonColor={'#000'}
              style={styles.buttonContent}
              onPress={() => {
                // call login API
                router.push('/sign-in');
              }}
            >
              Log In
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}
            >
              New to TwitSnap?
            </Text>
            <Button
              icon="account-plus-outline"
              mode="contained"
              buttonColor={'#000'}
              style={styles.buttonContent}
              onPress={() => {
                router.push('/sign-up');
              }}
            >
              Sign up
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}
            >
              Or continue with
            </Text>
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={() => {
                handleGoogleSignIn();
                // initiate sign in
              }}
              disabled={isInProgress}
            />
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  logoContainer: {
    transform: [{ scale: 5.5 }],
    position: 'absolute',
    top: window.height / 2 + 255,
    left: window.width / 2 - 95
  },
  logo: {
    width: 150,
    height: 50
  },
  buttonContent: {
    height: 48,
    width: 350,
    justifyContent: 'center'
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 10
  }
});
