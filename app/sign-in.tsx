import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

interface signInForm {
    usernameOrMail: string;
    password: string;
}

const SignIn: React.FC = () => {
    const [form, setForm] = useState<signInForm>({
        usernameOrMail: '',
        password: '',
    });

    const handleChange = (name: string, value: string) => {
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = () => {

    };

    return (
        <View style={styles.container}>
            <Text style={{marginTop : 10}}>Username or Email:</Text>
            <TextInput
                style={styles.input}
                value={form.usernameOrMail}
                mode = "flat"
                onChangeText={(value) => handleChange('usernameOrMail', value)}
                placeholder="Username"
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
        marginBottom: 25,
        paddingHorizontal: 10,
        marginTop : 10,
    },
});

export default SignIn;