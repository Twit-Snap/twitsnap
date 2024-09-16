import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { View, Image, StyleSheet, Button } from 'react-native';
import { authenticatedAtom } from './authAtoms/authAtom';


export default function SignIn() {
    const [_, setIsAuthenticated] = useAtom(authenticatedAtom);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/images/logo.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.buttonContainer}>
                    <Button
                        title="Sign In"
                        onPress={() => {
                            // call login API
                            setIsAuthenticated({ email: 'emailInJWT@gmail.com', username: 'usernameInJWT', name: 'nameInJWT' });
                            // Navigate after signing in. You may want to tweak this to ensure sign-in is
                            // successful before navigating.
                            router.replace('/');
                        }}
                   />
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Sign Up"
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
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 50,
    },
    buttonContainer: {
        alignItems: 'center',
    },
});