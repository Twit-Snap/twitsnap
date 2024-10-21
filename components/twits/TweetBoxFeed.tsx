import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, IconButton, TextInput } from 'react-native-paper';

interface NewTweetInputProps {
  onTweetSend: (tweetContent: string) => void;
  onClose: () => void;
  placeholder?: string;
}

const NewTweetInput: React.FC<NewTweetInputProps> = ({ onTweetSend, onClose, placeholder }) => {
  const [tweetContent, setTweetContent] = useState<string>('');

  const handleSendTweet = () => {
    if (tweetContent.trim().length > 0) {
      onTweetSend(tweetContent);
      setTweetContent(''); // Clear the input after sending the tweet
      onClose();
    }
  };

  return (
    <>
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={25}
          style={{ margin: 0 }}
          onPress={onClose}
          iconColor="rgb(255 255 255)"
        />
        <Button
          mode="contained"
          compact={true}
          buttonColor={'#1494df'}
          onPress={() => handleSendTweet()}
          style={[styles.post_button, { opacity: tweetContent.trim().length > 0 ? 1 : 0.5 }]}
          aria-disabled={true}
          labelStyle={{
            fontWeight: 'bold',
            textAlign: 'center',
            textAlignVertical: 'center',
            margin: 0
          }}
          contentStyle={{ height: 35, marginBottom: 2 }}
        >
          Post
        </Button>
      </View>
      <View style={styles.container}>
        <Image style={styles.profile_logo} source={require('@/assets/images/messi.jpg')} />
        <TextInput
          style={styles.input}
          cursorColor="rgb(255 255 255)"
          textColor="rgb(255 255 255)"
          outlineStyle={{
            borderWidth: 0,
            backgroundColor: 'rgb(5 5 5)'
          }}
          contentStyle={{ padding: 10 }}
          mode="outlined"
          placeholder={placeholder || "What's happening?"}
          value={tweetContent}
          onChangeText={setTweetContent}
          multiline
          maxLength={280} // Limit to 280 characters like Twitter
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'flex-start',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    maxWidth: '100%'
  },
  profile_logo: {
    width: 40,
    height: 40,
    borderRadius: 200
  },
  header: {
    paddingTop: 10,
    maxHeight: 45,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  post_button: {
    paddingHorizontal: 10,
    marginRight: 11,
    paddingTop: 0
  },
  input: {
    width: '90%',
    borderWidth: 0,
    borderRadius: 10,
    padding: 0,
    margin: 0,
    paddingTop: 8,
    textAlignVertical: 'center'
  }
});

export default NewTweetInput;
