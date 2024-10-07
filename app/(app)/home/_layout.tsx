import HomeHeader from "@/components/feed/header";
import { Slot } from "expo-router";
import { Dimensions, StyleSheet, View } from "react-native";

const window = Dimensions.get("window");

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 20,
		flexDirection: "column",
	},
	header: {
		height: window.height / 10,
		width: window.width,
	},
});

export default function HomeLayout() {
	return (
		<>
			<View style={styles.container}>
				<View style={styles.header}>
					<HomeHeader />
				</View>
				<Slot />
			</View>
		</>
	);
}
