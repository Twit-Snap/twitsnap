import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

export default function ListHeader({
  children,
  headerText
}: {
  children: React.ReactNode;
  headerText: string;
}) {
  return (
    <View style={styles.container}>
      <View
        style={{ flex: 1, flexDirection: 'row', minHeight: 57, maxHeight: 57, zIndex: 1}}
      >
        <TouchableOpacity onPress={router.back}>
          <IconButton icon="arrow-left" iconColor="rgb(255 255 255)" size={30} />
        </TouchableOpacity>
        <Text style={styles.header}> {headerText} </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)',
    paddingHorizontal: 2
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgb(255 255 255)',
    textAlignVertical: 'center'
  }
});
