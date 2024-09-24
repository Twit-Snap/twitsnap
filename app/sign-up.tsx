import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

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

  const handleSubmit = () => {
    if (form.password !== form.repeatPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }
    fetch(`${process.env.SERVER_URL}auth/register`.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success:', data);
            alert('Success! Registering.');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error! Wrong credentials.');
        });
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