import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TwitSnap } from '@/app/types/TwitSnap';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  feed_type: {
    maxHeight: window.height / 20 + 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgb(5 5 5)'
  },
  feed_type_container: {
    flex: 1,
    maxHeight: window.height / 20,
    paddingHorizontal: 5
  },
  feed_type_button: {
    height: window.height / 20,
    color: 'rgb(255, 255, 255)',
    textAlign: 'center'
  },
  feed_type_selected: {
    height: 1,
    borderColor: 'rgb(3, 165, 252)',
    borderRadius: 10
  }
});

export interface FeedTypeProp {
  text: string;
  state: boolean;
  handler: (twits: TwitSnap[] | null, feedType: string) => Promise<void>;
}

export interface IFeedTypeProps {
  items: FeedTypeProp[];
  twits: TwitSnap[] | null;
  feedType: string;
}

export default function FeedType(props: IFeedTypeProps) {
  const [items, setItems] = useState<FeedTypeProp[]>(props.items);

  const handlePress = (this_item: FeedTypeProp) => {
    setItems(
      items.map((item) => {
        if (this_item === item) {
          if (!item.state) {
            item.state = true;
            item.handler(props.twits, props.feedType);
          }
          return item;
        }

        item.state = false;
        return item;
      })
    );
  };

  return (
    <View style={styles.feed_type}>
      {items.map((item) => {
        return (
          <TouchableOpacity
            key={item.text}
            style={styles.feed_type_container}
            onPress={() => handlePress(item)}
          >
            <Text style={styles.feed_type_button}>{item.text}</Text>
            <Text
              style={[
                styles.feed_type_selected,
                item.state ? { borderWidth: 1.5 } : { borderWidth: 0 }
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
