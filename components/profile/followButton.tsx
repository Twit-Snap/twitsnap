import { useAtomValue } from 'jotai';
import React, { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import { SearchedUser } from '@/app/types/publicUser';
import useAxiosInstance from '@/hooks/useAxios';

type SpecialButtonProps = {
  color: string;
  text: string;
  textColor: string;
  handler: () => void;
};

interface IFollowButtonProps {
  extraCallback: (nowFollowing: boolean) => void;
  user: SearchedUser;
}

export default function FollowButton({ extraCallback, user }: IFollowButtonProps) {
  const authUser = useAtomValue(authenticatedAtom);
  const following = useRef<boolean>(user.following ? true : false);
  const axiosUsers = useAxiosInstance('users');

  const defineButtonProps = (following: boolean | undefined): SpecialButtonProps => {
    if (following) {
      return {
        color: 'rgb(5 5 5)',
        text: 'Following',
        textColor: 'rgb(255 255 255)',
        handler: async () => {
          await axiosUsers
            .delete(`users/${authUser?.username}/followers`, {
              data: {
                followedUsername: user.username
              }
            })
            .then(() => {
              setFollowingState();
              extraCallback(false);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      };
    }

    return {
      color: 'rgb(255 255 255)',
      text: 'Follow',
      textColor: 'rgb(0 0 0)',
      handler: async () => {
        await axiosUsers
          .post(`users/${authUser?.username}/followers`, {
            followedUsername: user.username
          })
          .then(() => {
            setFollowingState();
            extraCallback(true);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    };
  };

  const [specialButtonProps, setSpecialButtonProps] = useState<SpecialButtonProps>(
    defineButtonProps(user.following)
  );

  const setFollowingState = () => {
    following.current = !following.current;
    setSpecialButtonProps(defineButtonProps(following.current));
  };

  return (
    <Button
      compact={true}
      buttonColor={specialButtonProps.color}
      onPress={specialButtonProps.handler}
      style={styles.button}
      aria-disabled={true}
      labelStyle={{
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 14,
        lineHeight: 13,
        margin: 0,
        color: specialButtonProps.textColor
      }}
      contentStyle={{ height: 30, paddingHorizontal: 30, width: 150 }}
    >
      {specialButtonProps.text}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 11,
    paddingTop: 0,
    height: 30,
    borderColor: 'rgb(80 80 80)',
    borderWidth: 1,
    marginTop: 8,
    alignSelf: 'center',
    justifyContent: 'center'
  }
});
