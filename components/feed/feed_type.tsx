import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";

const window = Dimensions.get("window");

const styles = StyleSheet.create({
	feed_type: {
		maxHeight: window.height / 20 + 10,
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "rgb(5 5 5)",
	},
	feed_type_container: {
        flex: 1,
		maxHeight: window.height / 20,
		paddingHorizontal: 5,
	},
	feed_type_button: {
		height: window.height / 20,
		color: "rgb(255, 255, 255)",
		textAlign: "center",
	},
	feed_type_selected: {
		height: 1,
		borderColor: "rgb(3, 165, 252)",
		borderRadius: 10,
	},
});

export interface FeedTypeProp {
	text: string;
	initial_state: boolean;
	handler: () => undefined;
}

export interface IFeedTypeProps {
	items: FeedTypeProp[];
}

export default function FeedType(props: IFeedTypeProps) {
	const [items, setItems] = useState<IFeedTypeProps>(props);

	const handlePress = (this_item: FeedTypeProp) => {
		setItems({
			items: items.items.map((item) => {
				if (this_item === item) {
					item.initial_state = true;
					item.handler();
					return item;
				}
                
				item.initial_state = false;
				return item;
			}),
		});
	};

	return (
		<View style={styles.feed_type}>
			{items.items.map((item) => {
				return (
					<TouchableOpacity
						key={item.text}
						style={styles.feed_type_container}
						onPress={() => handlePress(item)}>
						<Text style={styles.feed_type_button}>{item.text}</Text>
						<Text
							style={[
								styles.feed_type_selected,
								item.initial_state
									? { borderWidth: 1.5 }
									: { borderWidth: 0 },
							]}
						/>
					</TouchableOpacity>
				);
			})}
		</View>
	);
}
