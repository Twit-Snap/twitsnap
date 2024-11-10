import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importa el icono
import * as ImagePickerOS from 'expo-image-picker'; // Importa la librería para seleccionar imágenes
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { firebase } from '../../firebaseConfig';

const default_images = {
  default_profile_picture: require('../../assets/images/no-profile-picture.png')
};

interface ImagePickerProps {
  uid: string; // User ID for storage reference
  onImagePicked: (uri: string) => void; // Callback to pass the selected image URI
}

const ImagePicker: React.FC<ImagePickerProps> = ({ uid, onImagePicked }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null); // Estado para la imagen de perfil

  const handleImagePick = async () => {
    // Solicitar permisos para acceder a la galería
    const permissionResult = await ImagePickerOS.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    // Abrir la galería para seleccionar una imagen
    const result = await ImagePickerOS.launchImageLibraryAsync({
      mediaTypes: ImagePickerOS.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Actualiza el estado con la URI de la imagen seleccionada
      onImagePicked(result.assets[0].uri); // Llama al callback con la URI de la imagen

      // Subir la imagen a Firebase Storage
      console.log(uid);
      console.log(result.assets);

      try {
        // option 1 with blob
        const response = await fetch(result.assets[0].uri);
        console.log(response);
        const blob = await response.blob();
        const reference = firebase.storage().ref().child(`profileImages/${new Date().getTime()}`);
        console.log(reference);

        const uploadTask = await reference.put(blob); // Sube la imagens
        const url = await uploadTask.ref.getDownloadURL();
        console.log('Image uploaded to Firebase Storage', url);
      } catch (error) {
        console.error(
          'Error uploading image to Firebase Storage: ' +
            JSON.stringify({ ...(error as object) }, null, 2),
          error
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={profileImage ? { uri: profileImage } : default_images.default_profile_picture}
          style={styles.profileImage}
        />
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="pencil" size={14} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Hace que la imagen sea circular
    marginTop: 10
  },
  iconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    borderRadius: 15,
    padding: 5
  }
});

export default ImagePicker;