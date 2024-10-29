import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { IReducedUser } from '@/app/types/publicUser';
import ListHeader from '@/components/profile/listHeader';
import UserCard from '@/components/profile/userCard';
import axios from 'axios';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAtomValue } from 'jotai';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function Follows() {
  const userData = useAtomValue(authenticatedAtom);

  const { username, byFollowers } = useLocalSearchParams<{
    username: string;
    byFollowers: string;
  }>();

  const [users, setUsers] = useState<IReducedUser[] | null>(null);
  const lastUserRef = useRef<IReducedUser | null>(null);
  const loadMoreRef = useRef<boolean>(true);

  const fetchUsers = async () => {
    if (!byFollowers || !username || !userData?.token) {
      return;
    }

    await axios
      .get(`${process.env.EXPO_PUBLIC_USER_SERVICE_URL}users/${username}/followers`, {
        params: {
          byFollowers: byFollowers,
          limit: 20,
          createdAt: lastUserRef.current ? lastUserRef.current.followCreatedAt : undefined
        },
        headers: {
          Authorization: `Bearer ${userData.token}`
        },
        timeout: 10000
      })
      .then(({ data }: { data: IReducedUser[] }) => {
        console.log('Fetched ', data.length, ' users');

        setUsers((prevUsers) => {
          if (data.length !== 0) {
            loadMoreRef.current = true;
          }

          const ret = prevUsers ? [...prevUsers, ...data] : data;
          lastUserRef.current = ret[ret.length - 1];

          return ret;
        });
      })
      .catch((error) => {
        if (error.status === 400) {
          if (error.response.data.type === 'NOT MUTUAL FOLLOW') {
            alert('You should not be here ;)');
            setUsers([]);
            loadMoreRef.current = false;
          }
        }

        console.error(error);
      });
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();

      return () => {
        setUsers(null);
        loadMoreRef.current = true;
        lastUserRef.current = null;
      };
    }, [userData?.token, byFollowers, username])
  );

  return (
    <>
      <ListHeader headerText={byFollowers === 'true' ? 'Followers' : 'Following'}>
        {users ? (
          users.length > 0 ? (
            <FlatList
              scrollEventThrottle={50}
              onScroll={async ({ nativeEvent }) => {
                if (!loadMoreRef.current) {
                  return;
                }
                // User has reached the bottom?
                if (
                  nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
                  nativeEvent.contentSize.height * 0.8
                ) {
                  loadMoreRef.current = false;
                  await fetchUsers();
                }
              }}
              data={users}
              renderItem={({ item }) => (
                <UserCard
                  item={item}
                  handler={(username: string) =>
                    router.push({
                      pathname: `/(app)/profile/[username]`,
                      params: { username: username }
                    })
                  }
                />
              )}
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
