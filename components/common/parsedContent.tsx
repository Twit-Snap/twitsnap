import { router } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface IParsedContentProps {
  text: string | undefined;
}

export default function ParsedContent({ text }: IParsedContentProps) {
  if (!text) {
    return <Text>{''}</Text>;
  }

  const words = text.split(' ');
  return (
    <Text>
      {words.map((word, index) => {
        if (word.startsWith('#')) {
          return (
            <Text key={index}>
              <Text
                onPress={() => router.push({ pathname: `/searchResults`, params: { query: word } })}
                style={styles.special}
              >
                {word}
              </Text>{' '}
            </Text>
          );
        } else if (word.startsWith('@')) {
          return (
            <Text key={index}>
              <Text
                onPress={() =>
                  router.push({
                    pathname: `/(app)/profile/[username]`,
                    params: { username: word.slice(1) }
                  })
                }
                style={styles.special}
              >
                {word}
              </Text>{' '}
            </Text>
          );
        } else if (word.startsWith('https://')) {
          return (
            <Text key={index}>
              <Text onPress={() => Linking.openURL(word)} style={styles.special}>
                {word}
              </Text>{' '}
            </Text>
          );
        }

        return (
          <Text key={index} style={styles.normal}>
            {word}{' '}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  normal: {
    color: 'rgb(255 255 255)'
  },
  special: {
    color: 'rgb(67,67,244)'
  }
});
