import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

import useAxios from '@/hooks/useAxios';

import { authenticatedAtom } from './authAtoms/authAtom';

const RequestLocationPermissions = () => {
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const setUser = useSetAtom(authenticatedAtom);
  const axiosInstance = useAxios('users');

  useEffect(() => {
    const requestPermission = async () => {
      console.log('requestPermission');
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      console.log('status', status);
      if (status === 'granted') {
        getLocation();
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      }
    };

    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocation = async () => {
    console.log('getLocation');
    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    console.log('currentLocation', currentLocation.coords);
    axiosInstance.post('/users/location', {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude
    });
    setUser((prev) =>
      prev
        ? {
            ...prev,
            location: {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude
            }
          }
        : null
    );

    // Aquí puedes redirigir a otra pantalla o realizar alguna acción con la ubicación
    router.replace('/'); // Cambia '/next-screen' a la pantalla que desees
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Location Permissions</Text>
      {permissionStatus === 'granted' ? (
        <Text style={styles.successText}>Location permission granted! Fetching location...</Text>
      ) : (
        <Text style={styles.errorText}>Waiting for permission...</Text>
      )}
      {location && <Text style={styles.locationText}>Location: {JSON.stringify(location)}</Text>}
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(5, 5, 5)'
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20
  },
  successText: {
    color: 'green'
  },
  errorText: {
    color: 'red'
  },
  locationText: {
    marginTop: 20,
    color: 'white'
  }
});

export default RequestLocationPermissions;
