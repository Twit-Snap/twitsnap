import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAtom } from 'jotai';
import { authenticatedAtom } from './authAtoms/authAtom';
import { router } from 'expo-router';
const axios = require('axios').default;

interface signInForm {
    emailOrUsername: string;
    password: string;
}

const SignIn: () => React.JSX.Element = () => {
    const [_, setIsAuthenticated] = useAtom(authenticatedAtom);

    const [form, setForm] = useState<signInForm>({
        emailOrUsername: '',
        password: '',
    });

    const handleChange = (name: string, value: string) => {
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}auth/login`,
                form,
                {
                    headers: {'Content-Type': 'application/json'},
                }
            );

            if (response.status == 200) {
                await AsyncStorage.setItem('token', response.data.token);
                console.log("Login success: ", response.data);
                setIsAuthenticated({
                    id: response.data.id,
                    email: response.data.email,
                    username: response.data.username,
                    name: response.data.name
                });
                router.replace('/');
            }
        } catch (error: any) {
            if (error.response && error.response.status == 401) {
                console.log("Login failed: ", error.response.data);
                alert('Invalid username or password');
            } else {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
            }
        }
    }

        return (
            <View style={styles.container}>
                <Text style={{marginTop: 10}}>Username or Email:</Text>
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
                <Button
                    icon="form-select"
                    mode="contained"
                    buttonColor={'#000'}
                    onPress={handleSubmit}>
                    Sign Up
                </Button>
            </View>
        )
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
        marginBottom: 25,
        paddingHorizontal: 10,
        marginTop : 10,
    },
});

export default SignIn;