import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Entypo';

interface ThreeDotProps {
  onClose: () => void;
  onTwitDelete: () => void;
  onTwitEdit: () => void;
  twitIsFromUser: boolean;
}

const ThreeDotMenu: React.FC<ThreeDotProps> = ({
  onClose,
  onTwitDelete,
  onTwitEdit,
  twitIsFromUser
}) => {
  const getTwitMenu = () => {
    if (twitIsFromUser) {
      return (
        <View style={styles.menu}>
          <IconButton
            icon="close"
            size={25}
            style={{ margin: 0 }}
            onPress={onClose}
            iconColor="rgb(255 255 255)"
          />
          <TouchableOpacity style={styles.menuItem} onPress={onTwitDelete}>
            <Icon name="trash" size={20} color="white" />
            <Text style={styles.menuText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="pencil" size={20} color="white" onPress={onTwitEdit}/>
            <Text style={styles.menuText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="direction" size={20} color="white" />
            <Text style={styles.menuText}>Share</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.menu}>
          <IconButton
            icon="close"
            size={25}
            style={{ margin: 0 }}
            onPress={onClose}
            iconColor="rgb(255 255 255)"
          />
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="direction" size={20} color="white" />
            <Text style={styles.menuText}>Share</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return <View>{getTwitMenu()}</View>;
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

export default ThreeDotMenu;
