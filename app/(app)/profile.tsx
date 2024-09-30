import { useAtom } from 'jotai';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import ProfileHeader from '@/components/profile/ProfileHeader';
import TweetCard from '@/components/twits/TweetCard';

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
        {userData && (
          <ProfileHeader
            userAuth={userData}
            bio={"Hi! Welcome to my profile. \nI'm a huge Messi fan!"}
            profilePhoto={''}
            bannerPhoto={''}
          />
        )}
        <FlatList<Tweet>
          data={[]}
          renderItem={({ item }) => {
            return (
              <TweetCard
                profileImage={''}
                username={userData?.username || ''}
                content={item.content}
                date={item.date}
                name={''}
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
    padding: 20
  }
});
