import HomeHeader from "@/components/feed/header";
import { Slot } from "expo-router";
import {
	Dimensions,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const window = Dimensions.get("window");

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
		maxHeight: window.height / 20 + 10,
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "rgb(5 5 5)",
	},
	feed_type_container: {
		maxHeight: window.height / 20,
		paddingHorizontal: 5,
	},
	feed_type_button: {
		height: window.height / 20,
		width: window.width / 2 - 10,
		color: "rgb(255, 255, 255)",
		textAlign: "center",
	},
	feed_type_selected: {
		height: 1,
		width: window.width / 2 - 10,
		borderColor: "rgb(3, 165, 252)",
		borderWidth: 1.5,
		borderRadius: 10
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
					<TouchableOpacity
						style={styles.feed_type_container}
						onPress={() => {}}>
						<Text style={styles.feed_type_button}>For you</Text>
						<Text style={styles.feed_type_selected} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.feed_type_container}
						onPress={() => {}}>
						<Text style={styles.feed_type_button}>Following</Text>
						<Text style={styles.feed_type_selected} />
					</TouchableOpacity>
				</View>

				<Slot />
			</View>
		</>
	);
}
