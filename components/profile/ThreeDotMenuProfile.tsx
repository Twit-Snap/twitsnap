import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Entypo';

interface ThreeDotProps {
  onCloseOrFinish: () => void;
  handleLogOut: () => void;
}

const ThreeDotMenuProfile: React.FC<ThreeDotProps> = ({ onCloseOrFinish, handleLogOut }) => {
  const getProfileMenu = () => {
    return (
      <>
        <View style={styles.menu}>
          <IconButton
            icon="close"
            size={25}
            style={{ margin: 0 }}
            onPress={onCloseOrFinish}
            iconColor="rgb(255 255 255)"
          />
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <Icon name="pencil" size={20} color="white" />
            <Text style={styles.menuText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogOut}>
            <Icon name="log-out" size={20} color="white" />
            <Text style={styles.menuText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return <View>{getProfileMenu()}</View>;
};

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 10
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8
  },
  menuText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'white'
  }
});

export default ThreeDotMenuProfile;
