import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";

// Define the Tweet type
type Tweet = {
  id: string;
  author: string;
  content: string;
};

// Mock data for tweets
const tweets: Tweet[] = [
  { id: '1', author: 'User1', content: 'This is my first tweet!' },
  { id: '2', author: 'User2', content: 'React Native is awesome!' },
  { id: '3', author: 'User3', content: 'Building TwitSnap app' },
  { id: '4', author: 'User4', content: 'This is my first tweet!' },
  { id: '5', author: 'User3', content: 'React Native is awesome!' },
  { id: '6', author: 'User6', content: 'Building TwitSnap app' },
  // Add more mock tweets as needed
];

// Define props type for TweetItem
type TweetItemProps = {
  author: string;
  content: string;
};

const TweetItem: React.FC<TweetItemProps> = ({ author, content }) => (
  <View style={styles.tweetContainer}>
    <Text style={styles.author}>{author}</Text>
    <Text>{content}</Text>
  </View>
);

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to TwitSnap</Text>
      <FlatList<Tweet>
        data={tweets}
        renderItem={({ item }) => <TweetItem author={item.author} content={item.content} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tweetContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  author: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});