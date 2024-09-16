import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

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
        onChangeText={(value) => handleChange('name', value)}
        placeholder="Name"
      />
      <Text>Last Name:</Text>
      <TextInput
        style={styles.input}
        value={form.lastName}
        onChangeText={(value) => handleChange('lastName', value)}
        placeholder="Last Name"
      />
      <Text>Username:</Text>
      <TextInput
        style={styles.input}
        value={form.username}
        onChangeText={(value) => handleChange('username', value)}
        placeholder="Username"
      />
      <Text>Birth Date:</Text>
      <TextInput
        style={styles.input}
        value={form.birthDate}
        onChangeText={(value) => handleChange('birthDate', value)}
        placeholder="YYYY-MM-DD"
      />
      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        value={form.password}
        onChangeText={(value) => handleChange('password', value)}
        placeholder="Password"
        secureTextEntry
      />
      <Text>Repeat Password:</Text>
      <TextInput
        style={styles.input}
        value={form.repeatPassword}
        onChangeText={(value) => handleChange('repeatPassword', value)}
        placeholder="Repeat Password"
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSubmit} />
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