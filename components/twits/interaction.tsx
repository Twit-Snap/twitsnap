import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

const parseInteractionCount = (n: number): string => {
  if (n > 1_000_000_000) {
    return `${(n / 1_000_000_000.0).toPrecision(1)}B`;
  } else if (n > 1_000_000) {
    return `${(n / 1_000_000.0).toPrecision(1)}M`;
  } else if (n > 1_000) {
    return `${(n / 1000.0).toPrecision(1)}K`;
  }

  return n.toString();
};

export interface handlerReturn {
  state: boolean;
  count: number;
}

export interface InteractionProps {
  icon: string;
  icon_alt?: string;
  icon_alt_color?: string;
  initState: boolean;
  initCount: number;
  handler: (state: boolean, count: number) => Promise<handlerReturn>;
}

export default function Interaction({
  icon,
  initState,
  initCount,
  handler,
  icon_alt,
  icon_alt_color
}: InteractionProps) {
  const [state, setState] = useState<boolean>(initState);
  const [count, setCount] = useState<number>(initCount);

  return (
    <TouchableOpacity
      style={{ flex: 1, flexDirection: 'row' }}
      onPress={async () => {
        const ret = await handler(state, count);
        setState(ret.state);

        if (initCount != undefined) {
          setCount(ret.count);
        }
      }}
    >
      <IconButton
        style={styles.interaction_icon}
        icon={icon_alt ? (state ? icon_alt : icon) : icon}
        size={20}
        iconColor={icon_alt ? (state ? icon_alt_color : undefined) : undefined}
      />
      <Text style={styles.interaction_label}>
        {count != undefined ? parseInteractionCount(count) : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  interaction_icon: {
    margin: 0
  },
  interaction_label: {
    color: 'rgb(120 120 120)',
    textAlign: 'left',
    textAlignVertical: 'center',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 14,
    height: 36
  }
});
