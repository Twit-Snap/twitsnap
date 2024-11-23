import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

// @ts-ignore
export default function RangePicker({ setValue, value, onRangeChange, open, setOpen }) {
  const previousValue = useRef(value);
  const items = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' }
  ];
  return (
    <View style={styles.rangeBar}>
      <DropDownPicker
        items={items}
        multiple={false}
        containerStyle={styles.dropdownContainer}
        style={styles.picker}
        placeholder="Select a range"
        placeholderStyle={styles.placeholder}
        dropDownContainerStyle={styles.dropDownContainer}
        textStyle={styles.textStyle}
        arrowIconStyle={styles.arrowIcon}
        bottomOffset={10}
        open={open}
        setOpen={setOpen}
        setValue={setValue}
        value={value}
        onChangeValue={(newValue) => {
          if (newValue !== previousValue.current) {
            previousValue.current = newValue;
            onRangeChange(newValue);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(5 5 5)'
  },
  scrollContainer: {
    padding: 15
  },
  rangeBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    marginTop: 30
  },
  picker: {
    backgroundColor: 'rgb(28,28,28)',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 20
  },
  dropdown: {
    backgroundColor: 'rgb(20 20 20)', // Fondo del menú desplegable
    borderRadius: 10
  },
  itemStyle: {
    backgroundColor: 'rgb(150 150 150)', // Fondo de cada ítem del dropdown
    color: 'white' // Color del texto de cada ítem
  },
  dropdownContainer: {
    height: 10,
    width: '80%',
    backgroundColor: 'rgb(20, 20, 20)',
    borderRadius: 30,
    zIndex: 1000
  },
  dropdownList: {
    backgroundColor: 'rgb(30, 30, 30)',
    borderRadius: 10
  },
  statisticsContainer: {
    gap: 20
  },
  placeholder: {
    color: 'rgb(150 150 150)', // Color blanco para el texto del placeholder
    fontSize: 13 // Tamaño de la fuente para el placeholder
  },
  dropDownContainer: {
    backgroundColor: '#222', // Color oscuro para el menú desplegable
    borderColor: '#444', // Color del borde del menú
    borderWidth: 1, // Grosor del borde
    zIndex: 9999 // Asegura que el dropdown esté por encima
  },
  textStyle: {
    color: 'white', // Color blanco para el texto de los ítems del dropdown
    fontSize: 16 // Tamaño de la fuente para los ítems
  },
  arrowIcon: {
    color: 'white',
    transform: [{ scale: 1.5 }] // Ajusta el tamaño con transform
  }
});
