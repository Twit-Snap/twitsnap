import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  User
} from '@react-native-google-signin/google-signin';
import axios from 'axios';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { authenticatedAtom } from './authAtoms/authAtom';

GoogleSignin.configure({
  webClientId: '224360780470-maj4ma0cdjlm1o2376lv28m45rvm2e8e.apps.googleusercontent.com'
});
const window = Dimensions.get('window');

export default function FrontPage() {
  const [authAtom, setAuthAtom] = useAtom(authenticatedAtom);
  const [googleAuth, setGoogleAuth] = useState<{ userInfo: User } | undefined>();

  useEffect(() => {
    const loadAuth = async () => {
      console.log('effect', authAtom);
      if (!authAtom) {
        const session: string | null = await AsyncStorage.getItem('auth');
        console.log('if effect', session);

        if (!session) {
          return;
        }

        setAuthAtom(JSON.parse(session));
        router.replace('/');
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
          console.log('Login success: ', response.data);
          router.replace('/');
        }
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          console.log('Login failed: ', error.response.data);
          alert('Invalid username or password');
        } else {
          console.error('Error:', JSON.stringify(error, null, 2));
          alert('An error occurred. Please try again later.');
        }
      }
    },
    [setAuthAtom]
  );

  const handleGoogleSignUp = useCallback(
    async (userCreds: FirebaseAuthTypes.UserCredential, token: string) => {
      const { uid } = userCreds.user;
      const { providerId } = userCreds.additionalUserInfo!;
      const authData = {
        uid,
        providerId,
        token
      };
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}auth/sso/register`,
          authData,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        if (response.status === 200) {
          await AsyncStorage.setItem('auth', JSON.stringify(response.data));
          setAuthAtom(response.data);
          console.log('Login success: ', response.data);
          router.replace('/');
        }
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          console.log('Login failed: ', error.response.data);
          alert('Invalid username or password');
        } else {
          console.error('Error:', JSON.stringify(error, null, 2));
          alert('An error occurred. Please try again later.');
        }
      }
    },
    [setAuthAtom]
  );

  const handleSuccessGoogleSignIn = useCallback(
    async (userCreds: FirebaseAuthTypes.UserCredential, token: string) => {
      if (userCreds.additionalUserInfo?.isNewUser) {
        handleGoogleSignUp(userCreds, token);
        return;
      }
      handleDirectGoogleLogin(userCreds, token);
    },
    [handleDirectGoogleLogin, handleGoogleSignUp]
  );

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      console.log('success', JSON.stringify(response, null, 2));
      if (isSuccessResponse(response)) {
        setGoogleAuth({ userInfo: response.data });
        const idToken = response.data.idToken;
        console.log('idToken', idToken);
        const credential = auth.GoogleAuthProvider.credential(idToken);
        console.log('credential', JSON.stringify(credential, null, 2));
        // const { accessToken } = await GoogleSignin.getTokens();
        const userCredential = await auth().signInWithCredential(credential);

        // Get the Firebase ID token
        const firebaseIdToken = await userCredential.user.getIdToken();
        console.log('firebaseIdToken', firebaseIdToken);

        handleSuccessGoogleSignIn(userCredential, firebaseIdToken!);
        console.log('userSignin', JSON.stringify(userCredential, null, 2));
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
  }, [handleSuccessGoogleSignIn]);

  return (
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
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
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
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>
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
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>
          Or continue with
        </Text>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => {
            handleGoogleSignIn();
            // initiate sign in
          }}
          // disabled={isInProgress}
        />
        <Text>{googleAuth?.userInfo.user.email}</Text>
      </View>
    </View>
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
