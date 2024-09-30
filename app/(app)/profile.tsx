import React from "react";
import { View, ScrollView, StyleSheet, FlatList } from "react-native";
import TweetCard from "@/components/twits/TweetCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAtom } from 'jotai';
import { authenticatedAtom } from '../authAtoms/authAtom';

type Tweet = {
  id: string;
  content: string;
  date: string;
};


export default function ProfileScreen() {
  const [userData] = useAtom(authenticatedAtom) || { userAuth: null };

  return (
      <View style={styles.container}>
          <ScrollView>
            {userData && <ProfileHeader userAuth={userData} bio={"Hi! Welcome to my profile. \nI'm a huge Messi fan!"} profilePhoto={""} bannerPhoto={""} />}
              <FlatList<Tweet>
              data={[]}
              renderItem={({ item }) => {
                return (
                    <TweetCard profileImage={""}
                               username={userData?.username || ""}
                               content={item.content}
                               date={item.date}
                    />
              );
              }}
              scrollEnabled={false}
              ></FlatList>
          </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
