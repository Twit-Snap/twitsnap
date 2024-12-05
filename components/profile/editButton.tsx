import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function EditButton({ handler }: { handler: () => void }) {
  return (
    <Button
      compact={true}
      buttonColor={'rgb(5 5 5)'}
      onPress={handler}
      style={styles.button}
      aria-disabled={true}
      labelStyle={{
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
        lineHeight: 14,
        margin: 0,
        color: 'rgb(255 255 255)'
      }}
      contentStyle={{ height: 30, paddingHorizontal: 10, width: 150 }}
    >
      {'Edit profile'}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 11,
    paddingTop: 0,
    height: 30,
    borderColor: 'rgb(80 80 80)',
    borderWidth: 1,
    marginTop: 8,
    alignSelf: 'center',
    justifyContent: 'center'
  }
});
