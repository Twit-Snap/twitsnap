import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

import { blockedAtom } from '@/atoms/blockedAtom';
import useAxiosInstance from '@/hooks/useAxios';
import { authenticatedAtom } from './authAtoms/authAtom';

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  name: string;
  lastname: string;
  birthdate: string;
  repeatPassword: string;
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
    repeatPassword: ''
  });

  const handleChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value
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
        console.log('Register success: ', response.data);
        alert('Success Registering!');
        router.replace('/');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        if (error.response.data.type === 'INVALID_EMAIL') {
          console.log('invalid email: ', form.email);
          alert('Error! Invalid email.');
        } else {
          console.log('Register failed: ', JSON.stringify(error.response.data, null, 2));
          alert('Invalid username or password');
        }
      } else {
        console.error('Error:', JSON.stringify(error, null, 2));
        alert('Error! Some fields are missing or have incorrect format.');
        console.error('Error response: ', error.response);
        console.error('Error request: ', error.request);
        console.error('error message: ', error.message);
        console.error('error config: ', error.config);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text>Name:</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        mode="flat"
        onChangeText={(value) => handleChange('name', value)}
        placeholder="John"
      />
      <Text>Last Name:</Text>
      <TextInput
        style={styles.input}
        value={form.lastname}
        mode="flat"
        onChangeText={(value) => handleChange('lastname', value)}
        placeholder="Doe"
      />
      <Text>Email:</Text>
      <TextInput
        style={styles.input}
        value={form.email}
        mode="flat"
        onChangeText={(value) => handleChange('email', value)}
        placeholder="Email"
      />
      <Text>Username:</Text>
      <TextInput
        style={styles.input}
        value={form.username}
        mode="flat"
        onChangeText={(value) => handleChange('username', value)}
        placeholder="Username"
      />
      <Text>Birth Date:</Text>
      <TextInput
        style={styles.input}
        value={form.birthdate}
        mode="flat"
        onChangeText={(value) => handleChange('birthdate', value)}
        placeholder="YYYY-MM-DD"
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
      <Text>Repeat Password:</Text>
      <TextInput
        style={styles.input}
        value={form.repeatPassword}
        mode="flat"
        onChangeText={(value) => handleChange('repeatPassword', value)}
        placeholder="Repeat Password"
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
    marginBottom: 12,
    paddingHorizontal: 8
  }
});

export default SignUp;
