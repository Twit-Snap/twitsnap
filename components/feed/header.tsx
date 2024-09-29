import { Link } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
	container: {
		backgroundColor: "rgb(0,0,0)",
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingTop: 5,
		paddingLeft: 10,
		paddingRight: 10,
	},
	logo: {
		width: 40,
		height: 40,
	},
	profile_logo: {
		borderRadius: 60,
	},
	fake_container: {
		backgroundColor: "rgb(0,0,0)",
		width: 40,
		height: 40,
	},
});

export default function HomeHeader() {
	return (
		<View style={styles.container}>
			<Link href="/profile">
				<Image
					style={StyleSheet.compose(styles.logo, styles.profile_logo)}
					source={require("@/assets/images/messi.jpg")}
				/>
			</Link>
			<Image
				style={styles.logo}
				source={require("@/assets/images/logo.png")}
			/>
			<View style={styles.fake_container} />
		</View>
	);
}
