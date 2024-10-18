import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { IReducedUser } from '@/app/types/publicUser';
import ListHeader from '@/components/common/listHeader';
import UserCard from '@/components/profile/userCard';
import axios from 'axios';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function Follows() {
  const userData = useAtomValue(authenticatedAtom);

  const { username, byFollowers } = useLocalSearchParams<{
    username: string;
    byFollowers: string;
  }>();

  const [users, setUsers] = useState<IReducedUser[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchUsers = async () => {
        if (!byFollowers || !username || !userData?.token) {
          return;
        }

        await axios
          .get(`${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${username}/followers`, {
            params: { byFollowers: byFollowers },
            headers: {
              Authorization: `Bearer ${userData.token}`
            },
            timeout: 10000
          })
          .then((response) => {
            console.log(response.data);
            setUsers(response.data);
          })
          .catch((error) => console.error(error));
      };

      fetchUsers();

      return () => {
        setUsers(null);
      };
    }, [userData?.token, byFollowers, username])
  );

  return (
    <>
      <ListHeader headerText={byFollowers === 'true' ? 'Followers' : 'Following'}>
        {users ? (
          users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={({ item }) => <UserCard item={item} />}
              keyExtractor={(item) => item.id.toString()}
            />
          ) : byFollowers === 'true' ? (
            <View
              style={{
                marginHorizontal: 30,
                flex: 1,
                flexDirection: 'column',
                minHeight: '75%',
                justifyContent: 'center'
              }}
            >
              <Text style={{ color: 'rgb(255 255 255)', fontSize: 40, fontWeight: 'bold' }}>
                {`Looking for followers?`}
              </Text>
              <Text style={{ color: 'rgb(100 100 100)', fontSize: 16 }}>
                When someone follows this account, they'll show up here.
              </Text>
            </View>
          ) : (
            <View
              style={{
                marginHorizontal: 30,
                flex: 1,
                flexDirection: 'column',
                minHeight: '75%',
                justifyContent: 'center'
              }}
            >
              <Text style={{ color: 'rgb(255 255 255)', fontSize: 40, fontWeight: 'bold' }}>
                {`@${username} isn't following anyone`}
              </Text>
              <Text style={{ color: 'rgb(100 100 100)', fontSize: 16 }}>
                But it won't be for long! People they follow will show up here.
              </Text>
            </View>
          )
        ) : (
          <ActivityIndicator animating={true} color={'rgb(3, 165, 252)'} size={60} style={{}} />
        )}
      </ListHeader>
    </>
  );
}
