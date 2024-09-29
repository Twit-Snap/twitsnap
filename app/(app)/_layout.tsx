import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { authenticatedAtom } from "../authAtoms/authAtom";
import HomeHeader from "@/components/feed/header";

export default function RootLayout() {
	const [isAuthenticated] = useAtom(authenticatedAtom);

	if (!isAuthenticated) {
		return <Redirect href="/front-page" />;
	}

	return (
		<Tabs>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="home-outline"
							size={size}
							color={color}
						/>
					),
					header: () => <HomeHeader />,
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="search" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="person-outline"
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
