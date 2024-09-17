import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

interface NewTweetInputProps {
    onTweetSend: (tweetContent: string) => void;
}

const NewTweetInput: React.FC<NewTweetInputProps> = ({ onTweetSend }) => {
    const [tweetContent, setTweetContent] = useState<string>('');

    const handleSendTweet = () => {
        if (tweetContent.trim().length > 0) {
            onTweetSend(tweetContent);
            setTweetContent(''); // Clear the input after sending the tweet
        } else {
            Alert.alert('Error', 'Tweet content cannot be empty');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                mode = "outlined"
                placeholder="What's happening?"
                value={tweetContent}
                onChangeText={setTweetContent}
                multiline
                maxLength={280} // Limit to 280 characters like Twitter
            />
            <Button
                mode="contained"
                buttonColor={'#1494df'}
                onPress={handleSendTweet}>
                Send
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    input: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        textAlignVertical: 'top',
        backgroundColor: '#f9f9f9',
    },
});

export default NewTweetInput;
