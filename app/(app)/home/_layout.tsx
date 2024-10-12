import { Slot } from 'expo-router';
import { Dimensions, StyleSheet, View } from 'react-native';

import HomeHeader from '@/components/feed/header';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    height: window.height / 10,
    width: window.width
  }
});

export default function HomeLayout() {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <HomeHeader />
        </View>
        <Slot />
      </View>
    </>
  );
}
