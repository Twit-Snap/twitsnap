import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';

import ImagePicker from '../components/common/ImagePicker';

import { authenticatedAtom } from './authAtoms/authAtom';

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  name: string;
  lastname: string;
  birthdate: string;
  repeatPassword: string;
  profilePicture?: string;
}

const SignUp: () => React.JSX.Element = () => {
  const [, setIsAuthenticated] = useAtom(authenticatedAtom);
  const setBlocked = useSetAtom(blockedAtom);
  const axiosUsers = useAxiosInstance('users');

  const [form, setForm] = useState<SignUpForm>({
    name: '',
    lastname: '',
    email: '',
    username: '',
    birthdate: '',
    password: '',
    repeatPassword: '',
    profilePicture: undefined
  });

  const handleChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleImagePicked = (uri: string) => {
    setForm({
      ...form,
      profilePicture: uri
    });
  };

  const handleSubmit = async () => {
    if (form.password !== form.repeatPassword) {
      alert('Error! Passwords do not match.');
      return;
    }

    try {
      const response = await axiosUsers.post(`auth/register`, form, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 200) {
        await AsyncStorage.setItem('auth', JSON.stringify(response.data));
        setIsAuthenticated(response.data);
        setBlocked(false);
        alert('Success Registering!');
        router.replace('/');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        alert('Error! Invalid email or username.');
      } else {
        alert('Error! Some fields are missing or have incorrect format.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        label="First Name"
        value={form.name}
        mode="outlined"
        onChangeText={(value) => handleChange('name', value)}
        placeholder="First Name"
        theme={inputTheme}
      />
      <TextInput
        style={styles.input}
        label="Last Name"
        value={form.lastname}
        mode="outlined"
        onChangeText={(value) => handleChange('lastname', value)}
        placeholder="Last Name"
        theme={inputTheme}
      />
      <TextInput
        style={styles.input}
        label="Email"
        value={form.email}
        mode="outlined"
        onChangeText={(value) => handleChange('email', value)}
        placeholder="Email"
        theme={inputTheme}
      />
      <TextInput
        style={styles.input}
        label="Username"
        value={form.username}
        mode="outlined"
        onChangeText={(value) => handleChange('username', value)}
        placeholder="Username"
        theme={inputTheme}
      />
      <TextInput
        style={styles.input}
        label="Birthdate"
        value={form.birthdate}
        mode="outlined"
        onChangeText={(value) => handleChange('birthdate', value)}
        placeholder="YYYY-MM-DD"
        theme={inputTheme}
      />
      <TextInput
        style={styles.input}
        value={form.password}
        mode="outlined"
        label="Password"
        onChangeText={(value) => handleChange('password', value)}
        placeholder="Password"
        secureTextEntry
        theme={inputTheme}
      />
      <TextInput
        style={styles.input}
        value={form.repeatPassword}
        mode="outlined"
        label="Repeat Password"
        onChangeText={(value) => handleChange('repeatPassword', value)}
        placeholder="Repeat Password"
        secureTextEntry
        theme={inputTheme}
      />
      <ImagePicker username={form.username} onImagePicked={handleImagePicked} />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5, 5, 5)',
    padding: 10,
    paddingTop: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white'
  },
  input: {
    marginBottom: 12,
    color: 'white'
  },
  button: {
    marginTop: 20,
    backgroundColor: 'rgb(3, 165, 252)'
  }
});
const inputTheme = {
  colors: {
    primary: 'rgb(3, 165, 252)',
    placeholder: 'rgb(113, 118, 123)',
    onSurface: 'white',
    background: 'rgb(5, 5, 5)'
  }
};

export default SignUp;
