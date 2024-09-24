import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAtom } from 'jotai';
import { authenticatedAtom } from './authAtoms/authAtom';
import { router } from 'expo-router';

interface signInForm {
    emailOrUsername: string;
    password: string;
}

const SignIn: () => void = () => {
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
            const response = await fetch(`${process.env.SERVER_URL}auth/login`.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('token', data.token);
                console.log("Login success: ", data);
                setIsAuthenticated({email: data.email, username: data.username, name: data.name});
                router.replace('/');
            } else {
                console.log("Login failed: ", data);
                if (response.status === 401) {
                    alert('Error! Wrong credentials.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error! Wrong credentials.');
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