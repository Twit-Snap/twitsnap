import {Image, StyleSheet, Text, View} from "react-native";
import React from "react";

interface ProfileHeader {
    user: {
        name: string;
        username: string;
        profilePhoto: string;
        bannerPhoto: string;
        bio: string;
    }
}

const ProfileHeader: React.FC<ProfileHeader> = ({user}) => {
    return (
        <View>
            <View style={styles.profileHeader}>
                <View style={styles.textContainer}>
                    <Image source={{uri: user.profilePhoto}} style={styles.profilePhoto}></Image>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.username}>{user.username}</Text>
                </View>
            </View>
            <Text style={styles.bio}>{user.bio}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
profileHeader: {
    flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
},
profilePhoto: {
    width: 100,
        height: 100,
        borderRadius: 150 / 2,
        overflow: "hidden",
        borderWidth: 3,
        borderColor: "black",
        marginRight: 20,
},
name: {
    fontSize: 18,
    fontWeight: 'bold',
},
username: {
    fontSize: 16,
    color: '#666',
},
bio: {
    fontSize: 16,
        lineHeight: 24,
        marginBottom: 5,
},
textContainer: {
    flex: 1,
    justifyContent: 'center',
    },
});

export default ProfileHeader;