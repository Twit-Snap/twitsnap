import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';

const window = Dimensions.get('window');

export interface IFeedRefreshProps {
  profileURLs: (string | undefined)[];
  handler: () => void;
}

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

export default function FeedRefresh(props: IFeedRefreshProps) {
  return (
    <>
      <Button
        mode="contained"
        compact={true}
        buttonColor={'#1494df'}
        onPress={props.handler}
        style={[
          styles.button,
          //Center in middle of the window
          {
            width: 120 + 30 * (props.profileURLs.length - 1),
            left: (window.width - (120 + 30 * (props.profileURLs.length - 1))) * 0.5
          }
        ]}
        aria-disabled={true}
        contentStyle={{ height: '100%', justifyContent: 'center', marginTop: 3 }}
      >
        <View
          style={{
            alignContent: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <Text style={styles.label}>↑</Text>
          <View style={styles.container}>
            {props.profileURLs.map((uri: string | undefined) => (
              <Avatar.Image
                source={uri ? { uri: uri } : default_images.default_profile_picture}
                key={uri}
                size={30}
                style={{ alignSelf: 'center' }}
              />
            ))}
          </View>
          <Text style={styles.label}>posted</Text>
        </View>
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 0,
    top: 110,
    position: 'absolute',
    zIndex: 40,
    height: 45,
    paddingRight: 4
  },
  label: {
    fontSize: 16,
    color: 'rgb(255, 255, 255)',
    fontWeight: 'bold',
    alignSelf: 'center',
    height: '100%',
    textAlignVertical: 'center'
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    textAlignVertical: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    height: '100%',
    marginHorizontal: 5
  }
});
