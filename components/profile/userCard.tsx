import { IReducedUser } from '@/app/types/publicUser';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

export default function UserCard({ item }: { item: IReducedUser }) {
  // const renderContent = (text: string) => {
  //   const words = text.split(' ');
  //   return (
  //     <Text>
  //       {words.map((word, index) => {
  //         if (word.startsWith('#')) {
  //           return (
  //             <Text key={index}>
  //               <Text
  //                 onPress={() =>
  //                   router.push({ pathname: `/searchResults`, params: { hashtag: word } })
  //                 }
  //                 style={styles.hashtag}
  //               >
  //                 {word}
  //               </Text>{' '}
  //             </Text>
  //           );
  //         }
  //         return <Text key={index}>{word} </Text>;
  //       })}
  //     </Text>
  //   );
  // };

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/(app)/profile/[username]`,
          params: { username: item.username }
        })
      }
      style={styles.container}
      activeOpacity={0.4}
    >
      <>
        <Image
          source={
            item.profileImage ? { uri: item.profileImage } : default_images.default_profile_picture
          }
          style={styles.profileImage}
        />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={styles.contentContainer}>
            <Text style={styles.name}>
              {item.name} <Text style={styles.username}>@{item.username}</Text>
            </Text>
            {/* <Text style={styles.content}>{renderContent(item.description)}</Text> */}
          </View>
        </View>
      </>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(50 50 50)',
    backgroundColor: 'rgb(5 5 5)'
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25
  },
  contentContainer: {
    flex: 1,
    marginLeft: 10
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgb(255 255 255)'
  },
  username: {
    fontWeight: 'light',
    color: 'rgb(120 120 120)',
    fontSize: 14
  },
  content: {
    fontSize: 14,
    color: 'rgb(220 220 220)'
  },
  hashtag: {
    color: 'rgb(67,67,244)'
  }
});
