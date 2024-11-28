import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { IconButton } from 'react-native-paper';
import Share from 'react-native-share';

interface ShareButtonProps {
  twitId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ twitId }) => {
  const onShare = async () => {
    try {
      const result = await Share.open({
        message: `¡Check out this twitsnap!\n\n${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}twitShare/${twitId}`,
        showAppsToView: true
      });
    } catch (error: any) {
      if ((error as Error).message === 'User did not share') {
        console.log('Canceled share');
      } else {
        Alert.alert('Error', 'No se pudo compartir el twit');
      }
    }
  };

  return <IconButton icon="share-variant" style={styles.share_icon} size={20} onPress={onShare} />;
};

const styles = StyleSheet.create({
  share_icon: {
    margin: 0,
    marginBottom: 5
  }
});

export default ShareButton;
