import HomeHeader from "@/components/feed/header";
import { Slot } from "expo-router";

export default function HomeLayout() {
	return (
		<>
			<Slot />
		</>
	);
}
