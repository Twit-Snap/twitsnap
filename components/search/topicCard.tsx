import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';

export default function TopicCard({ topic }: { topic: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Trending </Text>
      <Text style={styles.text}>{topic.charAt(0).toUpperCase() + topic.slice(1)}</Text>
      <Divider style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)',
    alignContent: 'flex-start'
  },
  title: {
    color: 'rgb(169, 169, 169)',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4
  },
  divider: {
    marginVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  }
});
