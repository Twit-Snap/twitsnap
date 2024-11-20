// screens/VerificationScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import useAxiosInstance from '@/hooks/useAxios';

import { VerificationCodeInput } from '../../components/verification/input';
import { authenticatedAtom } from '../authAtoms/authAtom';

const window = Dimensions.get('window');

const VerificationScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const axiosUsers = useAxiosInstance('users');
  const setIsAuthenticated = useSetAtom(authenticatedAtom);

  const handleComplete = async (code: string, channel: string): Promise<boolean> => {
    setLoading(true);

    return await axiosUsers
      .post('auth/verify', { code, channel })
      .then(async ({ data }) => {
        await AsyncStorage.setItem('auth', JSON.stringify(data));
        setIsAuthenticated(data);
        router.replace('/home');
        return true;
      })
      .catch((error) => {
        if (error.status === 503) {
          Alert.alert('Service unavailable', 'Try again later');
          return true;
        }
        return false;
      })
      .finally(() => setLoading(false));
  };

  const handleResend = async (channel: string) => {
    await axiosUsers.post('auth/verify', { channel }).catch((error) => {
      if (error.status === 503) {
        Alert.alert('Service unavailable', 'Try again later');
      }
    });
  };

  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <VerificationCodeInput
          length={6}
          onComplete={handleComplete}
          loading={loading}
          onResend={handleResend}
          resendDelay={30}
        />
      </View>
      <View style={styles.footer}>
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
          onPress={() => router.replace('/home')}
        >
          {'Skip'}
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 60,
    minWidth: window.width,
    maxWidth: window.width,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16
  }
});

export default VerificationScreen;
