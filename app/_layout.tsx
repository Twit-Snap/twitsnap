import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { Provider } from 'jotai';

export default function Root() {
  
  const colorScheme = useColorScheme();

  // Set up the auth context and render our layout inside of it.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Provider>
      <Slot />
    </Provider>
    </ThemeProvider>
  );
}
