import { useAtom } from 'jotai/index';
import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Keyboard
} from 'react-native';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Entypo';

import { showTabsAtom } from '@/atoms/showTabsAtom';
import TweetBoxFeed from '@/components/twits/TweetBoxFeed';

const window = Dimensions.get('screen');

interface ThreeDotProps {
  onCloseOrFinish: () => void;
  onTwitDelete: () => void;
  onTwitEdit: (tweetContent: string) => void;
  twitIsFromUser: boolean;
  twitContent: string;
}

const ThreeDotMenu: React.FC<ThreeDotProps> = ({
  onCloseOrFinish,
  onTwitDelete,
  onTwitEdit,
  twitContent,
  twitIsFromUser
}) => {
  const [animatedEdit] = useState(new Animated.Value(window.height));
  const [isExpandedEdit, setIsExpandedEdit] = useState(false);
  const [showTabs, setShowTabs] = useAtom(showTabsAtom);

  const handleEdit = () => {
    setShowTabs(!showTabs);
    Animated.timing(animatedEdit, {
      toValue: isExpandedEdit ? window.height : 0, // Adjust the height as needed
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true
    }).start(() => {
      setIsExpandedEdit(!isExpandedEdit);
    });
    Keyboard.dismiss();
  };

  const getTwitMenu = () => {
    if (twitIsFromUser) {
      return (
        <>
          <View style={styles.menu}>
            <IconButton
              icon="close"
              size={25}
              style={{ margin: 0 }}
              onPress={onCloseOrFinish}
              iconColor="rgb(255 255 255)"
            />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onTwitDelete();
                onCloseOrFinish();
              }}
            >
              <Icon name="trash" size={20} color="white" />
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Icon name="pencil" size={20} color="white" />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="direction" size={20} color="white" />
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>
          </View>
          <Animated.View
            style={[
              {
                backgroundColor: 'rgb(5 5 5)',
                zIndex: 50,
                position: 'absolute',
                bottom: 0,
                top: 0,
                paddingTop: 35,
                width: window.width
              },
              {
                transform: [{ translateY: animatedEdit }],
                bottom: 0
              }
            ]}
          >
            <View style={{ height: window.height }}>
              <TweetBoxFeed
                onTweetSend={(tweetContent) => {
                  onTwitEdit(tweetContent);
                  handleEdit();
                  onCloseOrFinish();
                }}
                onClose={handleEdit}
                baseContent={twitContent}
              />
            </View>
          </Animated.View>
        </>
      );
    } else {
      return (
        <View style={styles.menu}>
          <IconButton
            icon="close"
            size={25}
            style={{ margin: 0 }}
            onPress={onCloseOrFinish}
            iconColor="rgb(255 255 255)"
          />
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="direction" size={20} color="white" />
            <Text style={styles.menuText}>Share</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return <View>{getTwitMenu()}</View>;
};

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 10
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8
  },
  menuText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'white'
  }
});

export default ThreeDotMenu;
