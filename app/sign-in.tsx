import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { Text, View } from 'react-native';
import { authenticatedAtom } from './atoms/loginAtom';


export default function SignIn() {
    const [_, setIsAuthenticated] = useAtom(authenticatedAtom);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text
        onPress={() => {
          setIsAuthenticated(true);
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace('/');
        }}>
        Sign In
      </Text>
    </View>
  );
}
