import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { formatDistanceToNow, parseISO } from 'date-fns';

const default_images =  {
    default_profile_picture: require('../../assets/images/no-profile-picture.png'),
}

interface TweetCardProps {
    profileImage: string; // URL to the image
    name: string;
    username: string;
    content: string;
    date: string;
}

const TweetCard: React.FC<TweetCardProps> = ({ profileImage, name, username, content, date }) => {
    const formatDate = (dateString: string): string => {
        const date = parseISO(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours > 24) {
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } else {
            return formatDistanceToNow(date, { addSuffix: true });
        }
    };
    return (
        <View style={styles.container}>
            <Image source={profileImage ? { uri: profileImage } : default_images.default_profile_picture}
                   style={styles.profileImage} />
            <View style={styles.contentContainer}>
                <Text style={styles.name}>{name} <Text style={styles.username}>@{username} <Text style={styles.date}>{formatDate(date)}</Text></Text></Text>

                <Text style={styles.content}>{content}</Text>
            </View>
        </View>
    );
}

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
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    username: {
        fontWeight: "light",
        color: '#666',
        fontSize: 14,
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
