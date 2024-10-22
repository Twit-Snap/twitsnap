import { atom } from 'jotai';
import { DeletedTwits } from '@/app/types/deleteType';

export const tweetDeleteAtom = atom<DeletedTwits>({ shouldDelete: false, twitId: [] });