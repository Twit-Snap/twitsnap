import { useState } from 'react';
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

export interface InteractionProps {
  icon: string;
  icon_alt?: string;
  icon_alt_color?: string;
  initState: boolean;
  count: number;
  handler: (state: boolean) => void;
}

export default function Interaction({
  icon,
  initState,
  count,
  handler,
  icon_alt,
  icon_alt_color
}: InteractionProps) {
  const [state, setState] = useState<boolean>(initState);

  return (
    <TouchableOpacity
      style={{ flex: 1, flexDirection: 'row' }}
      onPress={() => {
        handler(state);
        setState(!state);
      }}
    >
      <IconButton
        style={styles.interaction_icon}
        icon={icon_alt ? (state ? icon_alt : icon) : icon}
        size={20}
        iconColor={icon_alt ? (state ? icon_alt_color : undefined) : undefined}
      />
      <Text style={styles.interaction_label}>{parseInteractionCount(count)}</Text>
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
    textAlignVertical: 'bottom',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 14,
    height: 36
  }
});
