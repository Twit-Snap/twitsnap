import { router } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

export default function ListHeader({
  children,
  headerText
}: {
  children: React.ReactNode;
  headerText: string;
}) {
  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: 'rgb(5 5 5)' }}>
        <Appbar.BackAction onPress={router.back} color="rgb(255 255 255)" />
      </Appbar.Header>
      <Text style={styles.header}> {headerText} </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)',
    marginTop: StatusBar.currentHeight ? -StatusBar.currentHeight : 0,
    paddingHorizontal: 2
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'rgb(255 255 255)'
  }
});
