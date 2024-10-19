import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function EditButton() {
  const handler = () => {};

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
        margin: 0,
        color: 'rgb(255 255 255)'
      }}
      contentStyle={{ height: 35, marginBottom: 2, paddingHorizontal: 30, width: 150 }}
    >
      {'Edit profile'}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 11,
    paddingTop: 0,
    borderColor: 'rgb(80 80 80)',
    borderWidth: 1,
    marginTop: 10
  }
});
