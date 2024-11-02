import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';
import { authenticatedAtom } from './authAtoms/authAtom';

interface signInForm {
  emailOrUsername: string;
  password: string;
}

const SignIn: () => React.JSX.Element = () => {
  const [, setIsAuthenticated] = useAtom(authenticatedAtom);
  const setBlocked = useSetAtom(blockedAtom);
  const axiosUsers = useAxiosInstance('users');

  const [form, setForm] = useState<signInForm>({
    emailOrUsername: '',
    password: ''
  });

  const handleChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosUsers.post(`auth/login`, form, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

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
        alert('Invalid username or password');
      } else if (error.response?.status === 403) {
        console.log('User blocked');
      } else {
        console.error('Error:', JSON.stringify(error, null, 2));
        alert('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ marginTop: 10 }}>Username or Email:</Text>
      <TextInput
        style={styles.input}
        value={form.emailOrUsername}
        mode="flat"
        onChangeText={(value) => handleChange('emailOrUsername', value)}
        placeholder="Username"
      />
      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        value={form.password}
        mode="flat"
        onChangeText={(value) => handleChange('password', value)}
        placeholder="Password"
        secureTextEntry
      />
      <Button icon="form-select" mode="contained" buttonColor={'#000'} onPress={handleSubmit}>
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 25,
    paddingHorizontal: 10,
    marginTop: 10
  }
});

export default SignIn;
