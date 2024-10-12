import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  User
} from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { authenticatedAtom } from './authAtoms/authAtom';

GoogleSignin.configure();
const window = Dimensions.get('window');

export default function FrontPage() {
  const [auth, setAuth] = useAtom(authenticatedAtom);
  const [googleAuth, setGoogleAuth] = useState<{ userInfo: User } | undefined>();

  useEffect(() => {
    const loadAuth = async () => {
      if (!auth) {
        const session: string | null = await AsyncStorage.getItem('auth');

        if (!session) {
          return;
        }

        setAuth(JSON.parse(session));
        router.replace('/');
      }
    };

    loadAuth();
  }, [auth, setAuth]);

  // Somewhere in your code
  const handleGoogleSignIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setGoogleAuth({ userInfo: response.data });
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  }, []);

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
