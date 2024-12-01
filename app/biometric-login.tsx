import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import React, { useCallback, useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { authenticatedAtom } from './authAtoms/authAtom';
import { UserAuth } from './types/authTypes';

const BiometricLogin = () => {
  const [authAtom, setAuthAtom] = useAtom(authenticatedAtom);

  const handleFingerprintLogin = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate',
        fallbackLabel: 'Use Passcode'
      });

      if (result.success) {
        const session: string | null = await AsyncStorage.getItem('auth');
        if (!session) {
          router.replace('/front-page');
          return;
        }

        const userSession = JSON.parse(session) as UserAuth;
        setAuthAtom(userSession);
        router.replace('/');
      } else {
        console.log('Authentication failed');
      }
    } else {
      console.log('Fingerprint authentication is not available');
    }
  }, [setAuthAtom]);

  useEffect(() => {
    const loadAuth = async () => {
      if (authAtom) {
        router.replace('/');
      } else {
        const session: string | null = await AsyncStorage.getItem('auth');

        if (!session) {
          router.replace('/front-page');
          return;
        }

        handleFingerprintLogin();
      }
    };

    loadAuth();
  }, [authAtom, handleFingerprintLogin, setAuthAtom]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')} // Adjust the path to your logo image
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Continue with Fingerprint</Text>
      <Text style={styles.description}>Please use your fingerprint to log in to your account.</Text>
      <Button
        mode="contained"
        onPress={handleFingerprintLogin}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Use Fingerprint
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgb(5, 5, 5)'
  },
  logo: {
    width: 180, // Adjust the width as needed
    height: 60, // Adjust the height as needed
    marginBottom: 20 // Space between logo and title
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20
  },
  button: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgb(3, 165, 252)'
  },
  buttonLabel: {
    fontSize: 16,
    color: 'white'
  }
});

export default BiometricLogin;
