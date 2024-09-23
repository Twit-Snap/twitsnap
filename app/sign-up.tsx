import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

interface SignUpForm {
  name: string;
  lastName: string;
  username: string;
  birthDate: string;
  password: string;
  repeatPassword: string;
}

const SignUp: React.FC = () => {
  const [form, setForm] = useState<SignUpForm>({
    name: '',
    lastName: '',
    username: '',
    birthDate: '',
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
    // Add further validation and form submission logic here
    console.log('Form submitted', form);
  };

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
        value={form.lastName}
        mode = "flat"
        onChangeText={(value) => handleChange('lastName', value)}
        placeholder="Doe"
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
        value={form.birthDate}
        mode = "flat"
        onChangeText={(value) => handleChange('birthDate', value)}
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