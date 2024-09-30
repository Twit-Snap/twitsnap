import { router } from "expo-router";
import {
	Dimensions,
	Image,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

const window = Dimensions.get("screen");

const styles = StyleSheet.create({
	container: {
		backgroundColor: "rgb(5 5 5)",
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingTop: 35,
		paddingLeft: 10,
		paddingRight: 10,
		width: window.width,
		height: window.height / 10,
		alignItems: "center",
	},
	logo: {
		width: 40,
		height: 40,
	},
	profile_logo: {
		borderRadius: 200,
		alignSelf: "center",
	},
	fake_container: {
		width: 40,
		height: 40,
	},
});

export default function HomeHeader() {
	return (
		<>
			<View style={styles.container}>
				<TouchableOpacity onPress={() => router.replace("/profile")}>
					<Image
						style={StyleSheet.compose(
							styles.logo,
							styles.profile_logo
						)}
						source={require("@/assets/images/messi.jpg")}
					/>
				</TouchableOpacity>
				<Image
					style={StyleSheet.compose(styles.logo, { marginTop: 5 })}
					source={require("@/assets/images/logo.png")}
				/>
				<View style={styles.fake_container} />
			</View>
		</>
	);
}
