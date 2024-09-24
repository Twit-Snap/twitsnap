import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAtom } from 'jotai';
import { authenticatedAtom } from './authAtoms/authAtom';
import { router } from 'expo-router';

interface SignUpForm {
  email: string;
  username: string;
  password: string;
  name: string;
  lastname: string;
  birthdate: string;
  repeatPassword: string;
}

const SignUp: () => void = () => {
    const [_, setIsAuthenticated] = useAtom(authenticatedAtom);

    const [form, setForm] = useState<SignUpForm>({
    name: '',
    lastname: '',
    email: '',
    username: '',
    birthdate: '',
    password: '',
    repeatPassword: '',
  });

  const handleChange = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

    const handleSubmit = async () => {
        if (form.password !== form.repeatPassword) {
            alert('Error! Passwords do not match.');
            return;
        }

        try {
            const response = await fetch(`${process.env.SERVER_URL}auth/register`.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('token', data.token);
                console.log("Register success: ", data);
                alert('Success Registering!');
                setIsAuthenticated({id : data.id, email: data.email, username: data.username, name: data.name});
                router.replace('/');
            } else if (response.status === 400) {
                console.log("Register failed: ", data);
                alert('Something went wrong! Check the fields for registration.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error! Some fields are missing or have incorrect format.');
        }
    }

  return (
    <View style={styles.container}>
      <Text>Name:</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        mode = "flat"
        onChangeText={(value) => handleChange('name', value)}
        placeholder="John"
      />
      <Text>Last Name:</Text>
      <TextInput
        style={styles.input}
        value={form.lastname}
        mode = "flat"
        onChangeText={(value) => handleChange('lastname', value)}
        placeholder="Doe"
      />
      <Text>Email:</Text>
      <TextInput
          style={styles.input}
          value={form.email}
          mode = "flat"
          onChangeText={(value) => handleChange('email', value)}
          placeholder="Email"
      />
      <Text>Username:</Text>
      <TextInput
        style={styles.input}
        value={form.username}
        mode = "flat"
        onChangeText={(value) => handleChange('username', value)}
        placeholder="Username"
      />
      <Text>Birth Date:</Text>
      <TextInput
        style={styles.input}
        value={form.birthdate}
        mode = "flat"
        onChangeText={(value) => handleChange('birthdate', value)}
        placeholder="YYYY-MM-DD"
      />
      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        value={form.password}
        mode = "flat"
        onChangeText={(value) => handleChange('password', value)}
        placeholder="Password"
        secureTextEntry
      />
      <Text>Repeat Password:</Text>
      <TextInput
        style={styles.input}
        value={form.repeatPassword}
        mode = "flat"
        onChangeText={(value) => handleChange('repeatPassword', value)}
        placeholder="Repeat Password"
        secureTextEntry
      />
      <Button
          icon="form-select"
          mode="contained"
          buttonColor={'#000'}
          onPress={handleSubmit}>
        Sign Up
    </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default SignUp;