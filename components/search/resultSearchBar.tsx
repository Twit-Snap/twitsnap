import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(5 5 5)',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    width: window.width,
    maxHeight: 50,
    alignItems: 'center',
    marginLeft: -10
  },
  goBack: {
    paddingRight: 9
  },
  searchbar: {
    backgroundColor: 'rgb(46 46 46)',
    width: window.width * 0.8,
    height: 35,
    marginRight: 10,
    paddingHorizontal: 20,
    borderRadius: 200,
    color: 'rgb(255 255 255)',
    fontSize: 16
  },
  trendingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'rgb(255 255 255)'
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10
  }
});

interface IResultSearchBarProps {
  clearHandler: () => void;
  previousQuery: string;
}

export default function ResultSearchBar({ clearHandler, previousQuery }: IResultSearchBarProps) {
  const userData = useAtomValue(authenticatedAtom);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    if (searchQuery ? searchQuery.length > 0 : false) {
      router.push({ pathname: `/searchResults`, params: { query: searchQuery } });
      if (searchQuery !== previousQuery) {
        clearHandler();
      }
      setSearchQuery(undefined);
    }
  };

  if (!userData) {
    return <></>;
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={router.back} style={styles.goBack}>
          <IconButton icon="arrow-left" iconColor="rgb(255 255 255)" size={24} />
        </TouchableOpacity>
        <TextInput
          placeholder={'Search TwitSnap'}
          placeholderTextColor="rgb(150 150 150)"
          onChangeText={setSearchQuery}
          value={searchQuery}
          defaultValue={previousQuery}
          style={styles.searchbar}
          maxLength={80}
          onSubmitEditing={handleSubmit}
        />
      </View>
    </>
  );
}
