import useAxiosInstance from '@/hooks/useAxios';
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

  return (
    <Interaction
      icon="repeat-off"
      icon_alt="repeat"
      icon_alt_color="rgb(47, 204, 110  )"
      initState={initState}
      initCount={initCount}
      handler={async (state: boolean, count?: number): Promise<handlerReturn> => {
        console.log('asd');
        return { state: !state, count: count };
      }}
    />
  );
}
