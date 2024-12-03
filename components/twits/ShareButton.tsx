import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

interface ShareButtonProps {}

const ShareButton: React.FC<ShareButtonProps> = () => {
  return (
    <IconButton
      icon="share-variant"
      style={styles.share_icon}
      size={20}
      onPress={() => console.log('Pressed!')}
    />
  );
};

const styles = StyleSheet.create({
  share_icon: {
    margin: 0,
    marginBottom: 5
  }
});

export default ShareButton;
