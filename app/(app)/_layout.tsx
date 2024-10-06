import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAtom, useAtomValue } from "jotai";
import { authenticatedAtom } from "../authAtoms/authAtom";
import { showTabsAtom } from "@/atoms/showTabsAtom";

export default function RootLayout() {
	const [isAuthenticated] = useAtom(authenticatedAtom);

	if (!isAuthenticated) {
		return <Redirect href="/front-page" />;
	}

	const showTabs = useAtomValue(showTabsAtom);

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
					header: () => <></>,
					tabBarHideOnKeyboard: true,
					tabBarStyle: { display: showTabs ? "flex" : "none" },
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="search" size={size} color={color} />
					),
					tabBarHideOnKeyboard: true,
					tabBarStyle: { display: showTabs ? "flex" : "none" },
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
					tabBarHideOnKeyboard: true,
					tabBarStyle: { display: showTabs ? "flex" : "none" },
				}}
			/>
			<Tabs.Screen
				name="searchResults"
				options={{
					title: "searchResults",
					tabBarButton: () => null, // Hide the tab
					header: () => <></>,
				}}
			/>
		</Tabs>
	);
}
