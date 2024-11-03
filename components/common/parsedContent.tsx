import { router } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface IParsedContentProps {
  text: string | undefined;
  color?: string;
  fontSize?: number;
  fontWeight?: 'bold' | 'normal';
}

export default function ParsedContent({ text, color, fontSize, fontWeight }: IParsedContentProps) {
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
                style={[
                  styles.special,
                  {
                    fontSize: fontSize,
                    fontWeight: fontWeight
                  }
                ]}
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
                style={[
                  styles.special,
                  {
                    fontSize: fontSize,
                    fontWeight: fontWeight
                  }
                ]}
              >
                {word}
              </Text>{' '}
            </Text>
          );
        } else if (word.startsWith('https://')) {
          return (
            <Text key={index}>
              <Text
                onPress={() => Linking.openURL(word)}
                style={[
                  styles.special,
                  {
                    fontSize: fontSize,
                    fontWeight: fontWeight
                  }
                ]}
              >
                {word}
              </Text>{' '}
            </Text>
          );
        }

        return (
          <Text
            key={index}
            style={{
              color: color || 'white',
              fontSize: fontSize,
              fontWeight: fontWeight
            }}
          >
            {word}{' '}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  special: {
    color: 'rgb(3 165 252)'
  }
});
