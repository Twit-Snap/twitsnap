import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';
import { registerForPushNotificationsAsync } from '@/utils/notifications';

import { authenticatedAtom } from './authAtoms/authAtom';
import { UserAuth, UserSSORegisterDto } from './types/authTypes';

GoogleSignin.configure({
  webClientId: '224360780470-maj4ma0cdjlm1o2376lv28m45rvm2e8e.apps.googleusercontent.com'
});
const window = Dimensions.get('window');

export default function FrontPage() {
  const [authAtom, setAuthAtom] = useAtom(authenticatedAtom);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isBlocked, setBlocked] = useAtom(blockedAtom);
  const axiosUsers = useAxiosInstance('users');

  useEffect(() => {
    // const handleLocation = async (userSession: UserAuth) => {
    //   if (!userSession.location) {
    //     router.push('./sign-up-location');
    //   }
    // };
    const loadAuth = async () => {
      if (!authAtom) {
        const session: string | null = await AsyncStorage.getItem('auth');
        //const session: string | null = null; //To test sign in

        if (!session) {
          setIsLoadingSession(false);
          return;
        }
        const userSession = JSON.parse(session) as UserAuth;
        setAuthAtom(userSession);
        router.replace(`/profile/${userSession.username}/edit`);
        // router.replace('/biometric-login');
      } else {
        setIsLoadingSession(false);
        // handleLocation(authAtom);
      }
    };

    loadAuth();
  }, [authAtom, setAuthAtom]);

  const handleDirectGoogleLogin = useCallback(
    async (userCreds: FirebaseAuthTypes.UserCredential, token: string) => {
      const { uid } = userCreds.user;

      const expoToken = await registerForPushNotificationsAsync();

      const authData = {
        uid,
        token,
        expoToken
      };
      try {
        const response = await axiosUsers.post(`auth/sso/login`, authData, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 200) {
          await AsyncStorage.setItem('auth', JSON.stringify(response.data));
          setAuthAtom(response.data);
          setBlocked(false);
          router.replace('/');
        }
      } catch (error) {
        const errorAux = error as AxiosError;
        if (errorAux.response && errorAux.response.status === 401) {
          console.log('Login failed: ', errorAux.response.data);
          alert('Invalid username or password');
        } else if (errorAux.response?.status === 403) {
          console.log('User blocked');
        } else {
          console.error('Error:', JSON.stringify(errorAux, null, 2));
          console.error('Error data:', JSON.stringify(errorAux.response?.data, null, 2));
          alert('An error occurred. Please try again later.');
        }
      }
    },
    [axiosUsers, setAuthAtom, setBlocked]
  );

  const navigateToSsoSignUp = (userCreds: FirebaseAuthTypes.UserCredential, token: string) => {
    const params: Omit<UserSSORegisterDto, 'birthdate' | 'phoneNumber'> = {
      uid: userCreds.user.uid,
      token,
      providerId: userCreds.additionalUserInfo?.providerId || '',
      username: userCreds.user.email?.split('@')[0] || '',
      profilePicture: userCreds.user.photoURL || undefined
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

  if (isLoadingSession) {
    return <></>;
  }

  return (
    <>
      <StatusBar backgroundColor={'rgb(5 5 5)'} barStyle={'light-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={{ marginVertical: 150 }}>
            <Text
              style={{
                fontSize: 35,
                fontWeight: '300',
                textAlign: 'center',
                color: 'white'
              }}
            >
              Everything you love about Twitter,
            </Text>
            <Text
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'white'
              }}
            >
              but better.
            </Text>
          </View>
          <View style={{ position: 'absolute', bottom: 350, alignSelf: 'center' }}>
            {isBlocked && (
              <Text style={{ color: 'red', textAlign: 'center', fontSize: 20, fontWeight: '600' }}>
                We're sorry, but your account has been temporarily suspended. Please contact our
                support team for more information.
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              buttonColor={'white'}
              contentStyle={{
                marginTop: 8
              }}
              style={[styles.buttonContent, { opacity: isInProgress ? 0.3 : 1 }]}
              onPress={
                isInProgress
                  ? () => {}
                  : () => {
                      handleGoogleSignIn();
                      // initiate sign in
                    }
              }
            >
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Image
                  source={require('../assets/images/googleIcon.png')}
                  style={{ width: 30, height: 30, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: 'black'
                  }}
                >
                  Continue with google
                </Text>
              </View>
            </Button>
          </View>
          <View style={{ marginVertical: 10 }}>
            <Divider
              style={{
                backgroundColor: 'rgb(80 80 80)',
                height: 1.5,
                width: '85%',
                alignSelf: 'center'
              }}
            />
            <Text
              style={{
                position: 'absolute',
                bottom: -9,
                alignSelf: 'center',
                zIndex: 1,
                backgroundColor: 'rgb(5 5 5)',
                color: 'white',
                paddingHorizontal: 10,
                fontSize: 16
              }}
            >
              or
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              buttonColor={'rgb(3, 165, 252)'}
              labelStyle={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}
              style={styles.buttonContent}
              onPress={() => {
                router.push('/sign-up');
              }}
            >
              Create account
            </Button>
          </View>
          <View
            style={[
              styles.buttonContainer,
              { position: 'absolute', bottom: 20, alignSelf: 'center' }
            ]}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
                color: 'white'
              }}
            >
              Already have an account?
            </Text>
            <Button
              mode="contained"
              buttonColor={'#000'}
              labelStyle={{ color: 'rgb(3, 165, 252)', fontSize: 18, fontWeight: 'bold' }}
              style={[styles.buttonContent, { borderColor: 'rgb(100 100 100)', borderWidth: 1 }]}
              onPress={() => {
                router.push('/sign-in');
              }}
            >
              Sign in
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)'
  },
  logoContainer: {
    left: window.width / 2 - 77
  },
  logo: {
    width: 150,
    height: 50
  },
  buttonContent: {
    height: 48,
    width: 350,
    justifyContent: 'center',
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 10
  }
});
