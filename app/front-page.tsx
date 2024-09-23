import { router } from 'expo-router';
import { useAtom } from 'jotai';
import {View, Image, StyleSheet, Text} from 'react-native';
import { Button } from 'react-native-paper';
import { authenticatedAtom } from './authAtoms/authAtom';
import { Dimensions } from 'react-native';

const window = Dimensions.get('window');

export default function FrontPage() {
    const [_, setIsAuthenticated] = useAtom(authenticatedAtom);

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 35, fontWeight: "300", textAlign: 'center', marginBottom: 10, marginVertical: 10 }}>
                Everything you love about Twitter,
            </Text>
            <Text style={{ fontSize: 60, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                but better.
            </Text>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/logo_light.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.buttonContainer}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>Already have an account?</Text>
                <Button
                    icon="account-outline"
                    mode="contained"
                    buttonColor={'#000'}
                    style={styles.buttonContent}
                    onPress={() => {
                        // call login API
                        router.push('/sign-in');
                    }}>
                    Sign In
                </Button>
            </View>
            <View style={styles.buttonContainer}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>New to TwitSnap?</Text>
                <Button
                    icon="account-plus-outline"
                    mode="contained"
                    buttonColor={'#000'}
                    style={styles.buttonContent}
                    onPress={() => {
                        router.push('/sign-up');
                    }}>
                    Sign up
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    logoContainer: {
        transform: [{ scale: 5.5 }],
        position: 'absolute',
        top: (window.height / 2) + 255,
        left: (window.width / 2) - 95,
    },
    logo: {
        width: 150,
        height: 50,
    },
    buttonContent: {
        height: 48,
        width: 350,
        justifyContent: 'center',
    },
    buttonContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
});