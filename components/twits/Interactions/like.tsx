import useAxiosInstance from '@/hooks/useAxios';
import React from 'react';
import Interaction, { handlerReturn } from '../interaction';

export default function Like({
  initState,
  initCount,
  twitId
}: {
  initState: boolean;
  initCount: number | undefined;
  twitId: string;
}) {
  const axiosTwits = useAxiosInstance('twits');

  return (
    <Interaction
      icon="heart-outline"
      icon_alt="heart"
      icon_alt_color="rgb(255, 79, 56)"
      initState={initState}
      initCount={initCount}
      handler={async (state?: boolean, count?: number): Promise<handlerReturn> => {
        return state
          ? {
              state: await axiosTwits
                .delete(`likes`, {
                  data: {
                    twitId: twitId
                  },
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })
                .then(() => !state)
                .catch((error) => {
                  console.error(error);
                  return state;
                }) === true,
              count: count != undefined ? count - 1 : undefined
            }
          : {
              state: await axiosTwits
                .post(
                  `likes`,
                  {
                    twitId: twitId
                  },
                  {
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  }
                )
                .then(() => !state)
                .catch((error) => {
                  console.error(error);
                  return state;
                }) === true,
              count: count != undefined ? count + 1 : undefined
            };
      }}
    />
  );
}
