import React, { useState } from "react";
import { FlatList, View, ScrollView, StyleSheet, Image } from "react-native";
import TweetCard from "../../components/twits/TweetCard";
import TweetBoxFeed from "@/components/twits/TweetBoxFeed";
import {useAtom} from "jotai";
import {authenticatedAtom} from "@/app/authAtoms/authAtom";
import {TwitSnap} from "@/app/types/TwitSnap";

const feed_images = {
    logo: require('../../assets/images/logo_light.png'),
}

const TwitsInFeed: TwitSnap[] = [];

export default function FeedScreen() {
  const [tweets, setTweets] = useState(TwitsInFeed);
  const [userData] = useAtom(authenticatedAtom);

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
          <TweetBoxFeed onTweetSend={(tweetContent) => {
            const newTweet = {
              id: (tweets.length + 1).toString(),
              authorUsername: userData?.username || "Anonymous",
              authorName: userData?.name || "Anonymous",
              content: tweetContent,
              date: new Date().toISOString(),
            };
            setTweets([newTweet, ...tweets]);
          }}/>
          <FlatList<TwitSnap>
            data={tweets}
            renderItem={({ item }) => {
                return (
                    <TweetCard
                        profileImage={''}
                        username={item.authorName}
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