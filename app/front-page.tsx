import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

import { authenticatedAtom } from './authAtoms/authAtom';

const window = Dimensions.get('window');

export default function FrontPage() {
  const [auth, setAuth] = useAtom(authenticatedAtom);

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
        <Button
          icon="google"
          mode="contained"
          buttonColor={'#DB4437'}
          style={styles.buttonContent}
          onPress={() => {
            // call Google sign-in API
            console.log('Google sign-in');
          }}
        >
          Continue with Google
        </Button>
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
