import React from 'react';

import useAxiosInstance from '@/hooks/useAxios';

import Interaction, { handlerReturn } from '../interaction';

export default function Bookmark({
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
      icon="bookmark-outline"
      icon_alt="bookmark"
      icon_alt_color="rgb(173, 216, 230)"
      initState={initState}
      initCount={initCount}
      handler={async (state?: boolean, count?: number): Promise<handlerReturn> => {
        return state
          ? {
              state: await axiosTwits
                .delete(`bookmarks`, {
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
                }),
              count: count != undefined ? count - 1 : undefined
            }
          : {
              state:
                (await axiosTwits
                  .post(
                    `bookmarks`,
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
                  })) === true,
              count: count != undefined ? count + 1 : undefined
            };
      }}
    />
  );
}
