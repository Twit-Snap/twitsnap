import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const default_images =  {
    default_profile_picture: require('../../assets/images/no-profile-picture.png'),
}

interface TweetCardProps {
    profileImage: string; // URL to the image
    username: string;
    content: string;
    date: string;
}

const TweetCard: React.FC<TweetCardProps> = ({ profileImage, username, content, date }) => {
    return (
        <View style={styles.container}>
            <Image source={profileImage ? { uri: profileImage } : default_images.default_profile_picture}
                   style={styles.profileImage} />
            <View style={styles.contentContainer}>
                <Text style={styles.username}>{username} <Text style={styles.date}>{date}</Text></Text>
                <Text style={styles.content}>{content}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    contentContainer: {
        flex: 1,
        marginLeft: 10,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    content: {
        fontSize: 14,
        marginTop: 5,
        color: '#333',
    },
    date: {
        fontSize: 12,
        color: '#666',
    },
});

export default TweetCard;
