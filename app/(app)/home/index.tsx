import React, { useEffect, useState } from "react";
import {
	FlatList,
	View,
	ScrollView,
	StyleSheet,
	Dimensions,
	Animated,
} from "react-native";
import TweetCard from "@/components/twits/TweetCard";
import TweetBoxFeed from "@/components/twits/TweetBoxFeed";
import { useAtom } from "jotai";
import { authenticatedAtom } from "@/app/authAtoms/authAtom";
import { TwitSnap } from "@/app/types/TwitSnap";
import { IconButton } from "react-native-paper";
import { showTabsAtom } from "@/atoms/showTabsAtom";
import FeedType, { IFeedTypeProps } from "@/components/feed/feed_type";
const axios = require("axios").default;

const feed_images = {
	logo: require("@/assets/images/logo_light.png"),
};

const window = Dimensions.get("screen");

const TwitsInFeed: TwitSnap[] = [];

export default function FeedScreen() {
	const [userData] = useAtom(authenticatedAtom);
	const [tweets, setTweets] = useState<TwitSnap[]>(TwitsInFeed);

	const [animatedValue, setAnimatedValue] = useState(
		new Animated.Value(window.height)
	);
	const [isExpanded, setIsExpanded] = useState(false);

	const [showTabs, setShowTabs] = useAtom(showTabsAtom);

	const handlePress = () => {
		setShowTabs(!showTabs);

		Animated.timing(animatedValue, {
			toValue: isExpanded ? window.height : 0, // Adjust the height as needed
			duration: 300, // Animation duration in milliseconds
			useNativeDriver: true,
		}).start(({ finished }) => {
			setIsExpanded(!isExpanded);
		});
	};

	const feed: IFeedTypeProps = {
		items: [
			{
				text: "For you",
				handler: () => {},
				initial_state: true,
			},
			{
				text: "Following",
				handler: () => {},
				initial_state: false,
			},
		],
	};

	//   useEffect(() => {
	//       const loadTweets = async () => {
	//           const fetchedTweets = await fetchTweets();
	//           setTweets(fetchedTweets);
	//       };
	//       loadTweets();
	//   }, []);

	var temp: TwitSnap[] = [];
	for (let index = 0; index < 20; index++) {
		temp.push({
			id: `${index}`,
			user: { userId: index, name: "Sergio Agüero", username: "@kun" },
			content: "Messi is the GOAT! 🐐🇦🇷",
			createdAt: "2021-08-05",
		});
	}

	useEffect(() => setTweets(temp), []);

	const fetchTweets = async (): Promise<TwitSnap[]> => {
		let tweets: TwitSnap[] = [];
		try {
			const response = await axios.get(
				`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps`
			);
			tweets = response.data.data;
			console.log("Tweets fetched: ", tweets);
		} catch (error: any) {
			console.error("Error:", error);
			alert("An error occurred. Please try again later.");
		}
		return tweets;
	};

	const sendTwit = async (tweetContent: string) => {
		try {
			const response = await axios.post(
				`${process.env.EXPO_PUBLIC_TWITS_SERVICE_URL}snaps`,
				{
					authorId: userData?.id,
					authorName: userData?.name,
					authorUsername: userData?.username,
					content: tweetContent,
				},
				{
					headers: { "Content-Type": "application/json" },
				}
			);
			console.log("Twit sent: ", response.data);
		} catch (error: any) {
			console.error("Error:", error);
			alert("An error occurred. Please try again later.");
		}
	};

	return (
		<>
			<FeedType {...feed} />
			<View style={styles.container}>
				<ScrollView>
					<FlatList<TwitSnap>
						data={tweets}
						renderItem={({ item }) => {
							return (
								<TweetCard
									profileImage={""}
									name={item.user.name}
									username={item.user.username}
									content={item.content}
									date={item.createdAt}
								/>
							);
						}}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
					/>
				</ScrollView>
			</View>
			<IconButton
				icon="plus"
				style={{
					backgroundColor: "rgb(3, 165, 252)",
					zIndex: 10,
					alignSelf: "flex-end",
					width: 55,
					height: 55,
					borderRadius: 200,
					position: "absolute",
					top: window.height * 0.83,
					right: 15,
				}}
				iconColor="rgb(255 255 255)"
				onPress={handlePress}
			/>
			<Animated.View
				style={[
					{
						backgroundColor: "rgb(5 5 5)",
						zIndex: 50,
						position: "absolute",
						bottom: 0,
						top: 0,
						paddingTop: 35,
						width: window.width,
					},
					{
						transform: [{ translateY: animatedValue }],
						bottom: 0,
					},
				]}>
				<View style={{ height: window.height }}>
					<TweetBoxFeed
						onTweetSend={(tweetContent) => {
							sendTwit(tweetContent);
						}}
						onClose={handlePress}
					/>
				</View>
			</Animated.View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		padding: 10,
	},
});
