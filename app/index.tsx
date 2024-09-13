import React from "react";
import { FlatList, Text, View, StyleSheet, Image } from "react-native";

// Define the Tweet type
type Tweet = {
  id: string;
  author: string;
  content: string;
};

// Mock data for tweets
const tweets: Tweet[] = [
  { id: '1', author: 'Sergio Agüero', content: 'Messi is the GOAT! 🐐🇦🇷' },
  { id: '2', author: 'Ángel Di María', content: 'Proud to play alongside Leo for Argentina! 🇦🇷⚽' },
  { id: '3', author: 'Gerard Piqué', content: 'Missing those Barça days with Messi. What a player! 🔵🔴' },
  { id: '4', author: 'Andrés Iniesta', content: 'The magic we created at Camp Nou was unforgettable. #Messi' },
  { id: '5', author: 'Salomón Rondón', content: 'Respect to Messi, one of the greatest to ever play the game! 👏' },
];

// Define props type for TweetItem
type TweetItemProps = {
  author: string;
  content: string;
};

const TweetItem: React.FC<Tweet> = ({ author, content }) => (
  <View style={styles.tweetContainer}>
    <Text style={styles.author}>{author}</Text>
    <Text>{content}</Text>
  </View>
);

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <FlatList<Tweet>
        data={tweets}
        renderItem={({ item }) => <TweetItem {...item} />}
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 50,
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