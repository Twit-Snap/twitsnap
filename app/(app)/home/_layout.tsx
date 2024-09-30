import HomeHeader from "@/components/feed/header";
import { Slot } from "expo-router";
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const window = Dimensions.get("screen");

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
	},
	header: {
		height: window.height / 10,
		width: window.width,
	},
	feed_type: {
		maxHeight: window.height / 20,
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "rgb(5 5 5)",
		paddingBottom: 5,
		paddingHorizontal: 5,
	},
	feed_type_button: {
		height: window.height / 20,
		width: window.width / 2 - 10,
		borderBottomWidth: 2,
		borderColor: "rgb(3, 165, 252)",
		color: "rgb(255, 255, 255)",
		textAlign: "center",
	},
});

export default function HomeLayout() {
	return (
		<>
			<View style={styles.container}>
				<View style={styles.header}>
					<HomeHeader />
				</View>
				<View style={styles.feed_type}>
					<TouchableOpacity onPress={() => {}}>
						<Text style={styles.feed_type_button}>For you</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => {}}>
						<Text style={styles.feed_type_button}>Following</Text>
					</TouchableOpacity>
				</View>

				<Slot />
			</View>
		</>
	);
}
