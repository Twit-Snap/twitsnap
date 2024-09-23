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

const default_images = {
    profilePhoto: require('../../assets/images/messi.jpg'),
    bannerPhoto: require('../../assets/images/messi-banner.jpeg')
}

const ProfileHeader: React.FC<ProfileHeader> = ({user}) => {
    return (
        <View>
                <Image source={user.bannerPhoto ? {uri : user.bannerPhoto} : default_images.bannerPhoto} style={styles.bannerPhoto} />
                <View style={styles.profileHeader}>
                    <View style={styles.textContainer}>
                        <Image source={user.profilePhoto ? {uri : user.profilePhoto} : default_images.profilePhoto} style={styles.profilePhoto}></Image>
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
bannerPhoto: {
    width: '100%',
    height: 300,
    resizeMode: "cover"
    },
    profilePhoto: {
        width: 160,
        height: 160,
        borderRadius: 200,
        borderWidth: 3,
        borderColor: "black",
        top: -85,
        left: 20,
    },
name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -75,
    marginLeft: 25,
},
username: {
    fontSize: 16,
    color: '#666',
    marginLeft: 25
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