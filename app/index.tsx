import React, { useState } from "react";
import { Text, View, Button } from "react-native";

export default function Index() {
  const [count, setCount] = useState(0);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <Text>Welcome to TwitSnap</Text>
      <Text>Counter: {count}</Text>
      <View style={{ flexDirection: "row", margin: "auto" }}>
        <Button title="Increment" onPress={() => setCount(count + 1)} />
        <Button title="Decrement" onPress={() => setCount(count - 1)} />
      </View>
    </View>
  );
}