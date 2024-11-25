import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
import { Button, HelperText, IconButton, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAxiosInstance from '@/hooks/useAxios';
import { regexEmail } from '@/utils/email';

const window = Dimensions.get('window');

const ForgotPassword: () => React.JSX.Element = () => {
  const axiosUsers = useAxiosInstance('users');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const emailRef = useRef<RNTextInput | null>(null);

  const closeInput = () => {
    Keyboard.dismiss();
    if (!email.match(regexEmail)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }
    emailRef.current?.blur();
  };

  const handleSubmit = async () => {
    closeInput();

    // Validate email
    if (!email.match(regexEmail)) {
      setErrorMessage('Please enter a valid email.');
      return;
    }

    try {
      const response = await axiosUsers.post(
        `auth/forgot-password`,
        { email },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.status === 200) {
        setMessage('A reset link has been sent to your email.');
        setErrorMessage(null); // Clear any previous error messages
      } else {
        setMessage(null);
        setErrorMessage('Failed to send reset link. Please try again.');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessage(null);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

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
              Forgot Password
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              label="Email"
              ref={emailRef}
              theme={{
                colors: {
                  background: 'rgb(5 5 5)',
                  onSurfaceVariant: errorMessage ? 'rgb(255 100 100)' : 'white'
                }
              }}
              outlineColor={errorMessage ? 'rgb(255 100 100)' : 'rgb(100 100 100)'}
              activeOutlineColor={errorMessage ? 'rgb(255 100 100)' : 'rgb(3, 165, 252)'}
              contentStyle={{ color: 'white' }}
              selectionColor="rgb(3 165 252)"
              cursorColor="white"
              onFocus={() => setErrorMessage(null)}
            />
            {errorMessage && (
              <HelperText padding="none" type="error">
                {errorMessage}
              </HelperText>
            )}
            {message && (
              <Text
                style={{
                  color: 'rgb(255 100 100)',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {message}
              </Text>
            )}
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
              style={{ borderWidth: 1, borderColor: 'rgb(5 5 5)', height: 35, width: '100%' }}
              onPress={handleSubmit}
            >
              Send Reset Link
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  input: {
    marginTop: 10
  }
});

export default ForgotPassword;
