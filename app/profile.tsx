import React from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";

type Tweet = {
  id: string;
  content: string;
  date: string;
};

const user = {
  name: "Lionel Messi",
  username: "@leomessi",
  profilePhoto: require('../assets/images/messi.jpg'),
  bio: "Footballer | World Cup Winner | PSG Player",
  tweets: [
    { id: '1', content: "Fulbo", date: "2023-05-01" },
    { id: '2', content: "Happy to score and contribute to the win. Fuerza Argentina! 🇦🇷", date: "2023-04-28" },
    { id: '3', content: "Great training session today. Always working to improve. 💪", date: "2023-04-25" },
    { id: '4', content: "Thank you to all the fans for your constant support. You're amazing! ❤️", date: "2023-04-22" },
    { id: '5', content: "Excited for the upcoming matches. Let's go! ⚽", date: "2023-04-20" },
  ],
};

const TweetItem: React.FC<Tweet> = ({ content, date }) => (
  <View style={styles.tweetContainer}>
    <Text style={styles.tweetContent}>{content}</Text>
    <Text style={styles.tweetDate}>{date}</Text>
  </View>
);

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={user.profilePhoto} style={styles.profilePhoto} />
        <View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>
      </View>
      <Text style={styles.bio}>{user.bio}</Text>
      <Text style={styles.tweetsHeader}>Recent Tweets</Text>
      <FlatList<Tweet>
        data={user.tweets}
        renderItem={({ item }) => <TweetItem {...item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#666',
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  tweetsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tweetContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  tweetContent: {
    fontSize: 14,
    marginBottom: 5,
  },
  tweetDate: {
    fontSize: 12,
    color: '#666',
  },
});