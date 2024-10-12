import { formatDistanceToNow, parseISO } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface TweetCardProps {
  profileImage: string; // URL to the image
  name: string;
  username: string;
  content: string;
  date: string;
}

const parseInteractionCount = (n: number): string => {
  if (n > 1_000_000_000) {
    return `${(n / 1_000_000_000.0).toPrecision()}B`;
  } else if (n > 1_000_000) {
    return `${(n / 1_000_000.0).toPrecision()}M`;
  } else if (n > 1_000) {
    return `${(n / 1000.0).toPrecision()}k`;
  }

  return n.toString();
};


const TweetCard: React.FC<TweetCardProps> = ({ profileImage, name, username, content, date }) => {
  const formatDate = (dateString: string): string => {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours > 24) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const renderContent = (text: string) => {
    const words = text.split(' ');
    return (
      <Text>
        {words.map((word, index) => {
          if (word.startsWith('#')) {
            return (
              <Text key={index}>
                <Text
                  onPress={() =>
                    router.push({ pathname: `/searchResults`, params: { hashtag: word } })
                  }
                  style={styles.hashtag}
                >
                  {word}
                </Text>{' '}
              </Text>
            );
          }
          return <Text key={index}>{word} </Text>;
        })}
      </Text>
    );
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.4}>
      <>
        <Image
          source={profileImage ? { uri: profileImage } : default_images.default_profile_picture}
          style={styles.profileImage}
        />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={styles.contentContainer}>
            <Text style={styles.name}>
              {name}{' '}
              <Text style={styles.username}>
                @{username}
                <Text style={styles.dot}>{' - '}</Text>
                <Text style={styles.date}>{formatDate(date)}</Text>
              </Text>
            </Text>
            <Text style={styles.content}>{renderContent(content)}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row' }}>
              <IconButton style={styles.interaction_icon} icon="comment-outline" size={20} />
              <Text style={styles.interaction_label}>123</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row' }}>
              <IconButton style={styles.interaction_icon} icon="repeat" size={20} />
              <Text style={styles.interaction_label}>123</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row' }}>
              <IconButton style={styles.interaction_icon} icon="heart-outline" size={20} />
              <Text style={styles.interaction_label}>123</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(50 50 50)',
    backgroundColor: 'rgb(5 5 5)',
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
  date: {
    fontSize: 12,
    color: 'rgb(120 120 120)'
  },
  hashtag: {
    color: 'rgb(67,67,244)'
  },
  dot: {
    fontSize: 16,
    color: 'rgb(120 120 120)'
  },
  interaction_icon: {
    margin: 0,
  },
  interaction_label: {
    color: 'rgb(120 120 120)',
    textAlign: 'left',
    textAlignVertical: 'center',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 14
  }
});

export default TweetCard;
