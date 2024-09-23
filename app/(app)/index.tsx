import React from "react";
import { FlatList, View, ScrollView, StyleSheet, Image } from "react-native";
import TweetCard from "../../components/twits/TweetCard";
import TweetBoxFeed from "@/components/twits/TweetBoxFeed";

const feed_images = {
    logo: require('../../assets/images/logo_light.png'),
}

// Define the Tweet type
type Tweet = {
  id: string;
  author: string;
  content: string;
  date: string;
};

// Mock data for tweets
const tweets: Tweet[] = [
  { id: '1', author: 'Sergio Agüero', content: 'Messi is the GOAT! 🐐🇦🇷', date: '2021-08-05' },
  { id: '2', author: 'Ángel Di María', content: 'Proud to play alongside Leo for Argentina! 🇦🇷⚽', date: '2021-08-04' },
  { id: '3', author: 'Gerard Piqué', content: 'Missing those Barça days with Messi. What a player! 🔵🔴', date: '2021-08-03' },
  { id: '4', author: 'Andrés Iniesta', content: 'The magic we created at Camp Nou was unforgettable. #Messi', date: '2021-08-02' },
  { id: '5', author: 'Salomón Rondón', content: 'Respect to Messi, one of the greatest to ever play the game! 👏', date: '2021-08-01' },
];

// Define props type for TweetItem
type TweetItemProps = {
  author: string;
  content: string;
};

export default function FeedScreen() {
  return (
    <View style={styles.container}>
        <ScrollView>
          <View style={styles.logoContainer}>
                <Image
                  source={feed_images.logo}
                  style={styles.logo}
                  resizeMode="contain"
                />
          </View>
          <TweetBoxFeed onTweetSend={(tweetContent) => console.log(tweetContent)} />
          <FlatList<Tweet>
            data={tweets}
            renderItem={({ item }) => {
                return (
                    <TweetCard
                        profileImage={''}
                        username={item.author}
                        content={item.content}
                        date={item.date}
                    />
                );
            }}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
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
});