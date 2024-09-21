import { router } from 'expo-router';
import { useAtom } from 'jotai';
import {View, Image, StyleSheet, Text} from 'react-native';
import { Button } from 'react-native-paper';
import { authenticatedAtom } from './authAtoms/authAtom';
import { SocialIcon } from 'react-native-elements'


export default function SignIn() {
    const [_, setIsAuthenticated] = useAtom(authenticatedAtom);

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 60, fontWeight: "300", textAlign: 'center', marginBottom: 20 }}>
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
                        setIsAuthenticated({ email: 'emailInJWT@gmail.com', username: 'usernameInJWT', name: 'nameInJWT' });
                        // Navigate after signing in. You may want to tweak this to ensure sign-in is
                        // successful before navigating.
                        router.replace('/');
                    }}>
                    Sign In
                </Button>
            </View>
            <View style={styles.buttonContainer}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>New to TwitSnap?</Text>
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
            <View style={styles.buttonContainer}>
                <SocialIcon
                    title="Register with Google account"
                    button
                    type="google"
                    style={styles.buttonContent}
                    onPress={() => {
                        router.push('/sign-up');
                    }}
                />
            </View>
            <View style={styles.buttonContainer}>
            <SocialIcon
                title="Register with Facebook Account"
                button
                type="facebook"
                style={styles.buttonContent}
                onPress={() => {
                    router.push('/sign-up');
                }}
            />
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
        transform: [{ scale: 8.5 }],
        position: 'absolute',
        bottom: 195,
        left : 195,

    },
    logo: {
        width: 150,
        height: 50,
    },
    buttonContent: {
        height: 40,
        width: 350,
    },
    buttonContainer: {
        alignItems: 'center',
        marginVertical: 10,
        transform: [{ translateX: 300 }, {translateY : 50}],
    },
});