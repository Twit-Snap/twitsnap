import { authenticatedAtom } from '@/app/authAtoms/authAtom';
import useAxiosInstance from '@/hooks/useAxios';
import { useAtomValue } from 'jotai';
import React from 'react';
import Interaction, { handlerReturn } from '../interaction';

export default function Retwit({
  initState,
  initCount,
  twitId
}: {
  initState: boolean;
  initCount: number | undefined;
  twitId: string;
}) {
  const axiosTwits = useAxiosInstance('twits');
  const userData = useAtomValue(authenticatedAtom);

  const postRetwit = async (state?: boolean, count?: number): Promise<handlerReturn> => {
    const newState =
      (await axiosTwits
        .post(
          `snaps`,
          {
            user: {
              userId: userData?.id,
              name: userData?.name,
              username: userData?.username
            },
            content: '',
            type: 'retwit',
            parent: twitId
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        .then(() => !state)
        .catch(() => {
          return state;
        })) === true;

    return {
      state: newState,
      count: count != undefined ? (newState !== state ? count + 1 : count) : undefined
    };
  };

  const deleteRetwit = async (state?: boolean, count?: number): Promise<handlerReturn> => {
    const newState =
      (await axiosTwits
        .delete(`snaps/${twitId}`, {
          params: {
            retwit: true
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(() => !state)
        .catch(() => {
          return state;
        })) === true;

    return {
      state: newState,
      count: count != undefined ? (newState !== state ? count - 1 : count) : undefined
    };
  };

  return (
    <Interaction
      icon="repeat-off"
      icon_alt="repeat"
      icon_alt_color="rgb(47, 204, 110  )"
      initState={initState}
      initCount={initCount}
      handler={async (state?: boolean, count?: number): Promise<handlerReturn> => {
        return state ? deleteRetwit(state, count) : postRetwit(state, count);
      }}
    />
  );
}
