import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import TweetCard from "@/components/twits/TweetCard";
import ProfileHeader from "@/components/profile/ProfileHeader";

type Tweet = {
  id: string;
  content: string;
  date: string;
};

const user = {
  name: "Lionel Messi",
  username: "@leomessi",
  profilePhoto: '../assets/images/messi.jpg',
  bannerPhoto: '../assets/images/messi-banner.jpg',
  bio: "Footballer | World Cup Winner | PSG Player",
  tweets: [
    { id: '1', content: "Fulbo", date: "2023-05-01" },
    { id: '2', content: "Happy to score and contribute to the win. Fuerza Argentina! 🇦🇷", date: "2023-04-28" },
    { id: '3', content: "Great training session today. Always working to improve. 💪", date: "2023-04-25" },
    { id: '4', content: "Thank you to all the fans for your constant support. You're amazing! ❤️", date: "2023-04-22" },
    { id: '5', content: "Excited for the upcoming matches. Let's go! ⚽", date: "2023-04-20" },
  ],
};

export default function ProfileScreen() {
  return (
      <View style={styles.container}>
      <ProfileHeader user={user} />
      <FlatList<Tweet>
        data={user.tweets}
        renderItem={({ item }) => {
          return (
              <TweetCard profileImage={user.profilePhoto}
                         username={user.name}
                         content={item.content}
                         date={item.date}
              />
        );
        }}
        ></FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
